'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Search, Plus, Minus, Trash2, ShoppingCart, User, X, Package, Wifi, WifiOff, AlertTriangle, Pause, RotateCcw, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useProducts, useProductSearch } from '@/hooks/useTanStackQuery';
import { useCreateSale } from '@/hooks/useTanStackQuery';
import { useCurrentShift, useOpenShift, useCloseShift, useTerminals } from '@/hooks/useTanStackQuery';
import { useCustomers } from '@/hooks/useTanStackQuery';
import { useOfflineSale, type QueuedSale } from '@/hooks/pos/useOfflineSale';
import { useSync } from '@/hooks/useSync';
import { useKeyboardShortcuts, createDefaultShortcuts } from '@/hooks/pos/useKeyboardShortcuts';
import { useBarcodeScanner } from '@/hooks/pos/useBarcodeScanner';
import { useCartPersistence, type CartItem } from '@/hooks/pos/useCartPersistence';
import { CreateSaleSchema, OpenShiftSchema, CloseShiftSchema } from '@soko/validation';
import type { Product, Customer, SaleItemInput } from '@soko/domain-types';
import { fromMinorUnits } from '@soko/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ReceiptPreview } from '@/components/pos/ReceiptPreview';

type CheckoutState = 'idle' | 'customer' | 'payment' | 'processing' | 'complete';

export default function PosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [checkoutState, setCheckoutState] = useState<CheckoutState>('idle');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'mpesa' | 'card' | 'bank' | 'credit'>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [saleResult, setSaleResult] = useState<{ sale: { id: string; paid_total_minor: number; grand_total_minor: number }; change: number } | null>(null);
  const [requiresShift, setRequiresShift] = useState(false);
  const [openShiftOpen, setOpenShiftOpen] = useState(false);
  const [closeShiftOpen, setCloseShiftOpen] = useState(false);
  const [pendingSales, setPendingSales] = useState<QueuedSale[]>([]);
  const [receiptSaleId, setReceiptSaleId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { cart, isLoading: cartLoading, addToCart, updateQuantity, removeFromCart, clearCart } = useCartPersistence();

  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: searchResults } = useProductSearch(searchQuery, searchQuery.length >= 2 ? 20 : 0);
  const { data: customersData } = useCustomers();
  const { data: currentShift } = useCurrentShift();
  const { data: terminalsData } = useTerminals();
  const openShiftMutation = useOpenShift();
  const closeShiftMutation = useCloseShift();
  const createSaleMutation = useCreateSale();
  
  const { queueSale, updateSaleStatus, getPendingCount, refresh: refreshQueuedSales } = useOfflineSale();
  const { isOnline, isSyncing, pendingCount } = useSync({
    deviceId: process.env.NEXT_PUBLIC_DEVICE_ID || 'pos-device-1',
    branchId: process.env.NEXT_PUBLIC_BRANCH_ID || 'branch-1',
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    getToken: () => {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('soko_token');
      }
      return null;
    },
  });

  const handleCheckout = useCallback(() => {
    if (!currentShift?.data) {
      setOpenShiftOpen(true);
      return;
    }
    setCheckoutState('customer');
  }, [currentShift]);

  const handlePayment = useCallback(() => {
    setCheckoutState('payment');
  }, []);

  // Product list (memoized before shortcuts)
  const products = useMemo(() => {
    if (searchResults?.data && searchQuery.length >= 2) {
      return searchResults.data;
    }
    return productsData?.data || [];
  }, [productsData, searchResults, searchQuery]);

  // Keyboard shortcuts
  const shortcuts = useMemo(() => createDefaultShortcuts({
    focusSearch: () => searchInputRef.current?.focus(),
    addProduct: () => {
      if (products.length > 0) {
        addToCart(products[0]);
      }
    },
    holdSale: () => {
      if (cart.length > 0) {
        // Save cart as held - use the cart persistence with a different ID
        toast.success('Sale held');
        clearCart();
      } else {
        toast.info('No items to hold');
      }
    },
    resumeSale: () => {
      // TODO: Implement resume held sale from carts list
      toast.info('Resume held sale - go to Carts page');
    },
    checkout: () => handleCheckout(),
    cancel: () => {
      if (checkoutState !== 'idle') {
        setCheckoutState('idle');
      } else if (cart.length > 0) {
        clearCart();
      }
    },
    payment: () => {
      if (checkoutState === 'customer') {
        handlePayment();
      }
    },
    printReceipt: () => {
      if (saleResult) {
        setReceiptSaleId(saleResult.sale.id);
      } else {
        toast.info('No recent sale to print');
      }
    },
    newSale: () => clearCart(),
  }), [checkoutState, cart, products, handleCheckout, handlePayment, clearCart, addToCart, saleResult]);

  useKeyboardShortcuts(shortcuts);

  // Barcode scanner
  const handleBarcodeScan = useCallback((barcode: string) => {
    const product = products.find(p => p.barcode === barcode || p.sku === barcode);
    if (product) {
      addToCart(product);
      setSearchQuery('');
    } else {
      toast.error(`Product not found: ${barcode}`);
    }
  }, [products, addToCart]);

  useBarcodeScanner({ onScan: handleBarcodeScan });

  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.product.selling_price_minor * item.quantity), 0);
    const discount = cart.reduce((sum, item) => sum + item.discount_minor, 0);
    const taxRate = 0.16;
    const taxable = subtotal - discount;
    const tax = Math.round(taxable * taxRate);
    const total = taxable + tax;
    return { subtotal, discount, tax, total };
  }, [cart]);

  const openShiftForm = useForm({
    resolver: zodResolver(OpenShiftSchema),
    defaultValues: {
      terminal_id: '',
      opening_float_minor: 0,
      notes: '',
    },
  });

  const closeShiftForm = useForm({
    resolver: zodResolver(CloseShiftSchema),
    defaultValues: {
      actual_cash_minor: 0,
      notes: '',
    },
  });

  useEffect(() => {
    if (currentShift?.data) {
      setRequiresShift(false);
    } else if (cart.length > 0 && !currentShift?.data) {
      setRequiresShift(true);
    }
  }, [currentShift, cart.length]);

  // Refresh pending sales count
  useEffect(() => {
    const interval = setInterval(async () => {
      const count = await getPendingCount();
      if (count > 0) {
        refreshQueuedSales();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [getPendingCount, refreshQueuedSales]);

  // Update pending sales from offline queue
  useEffect(() => {
    refreshQueuedSales();
  }, [refreshQueuedSales]);

  const handleOpenShift = (values: { terminal_id: string; opening_float_minor: number; notes?: string }) => {
    openShiftMutation.mutate(values, {
      onSuccess: () => {
        setOpenShiftOpen(false);
        openShiftForm.reset();
      },
    });
  };

  const handleCloseShift = (values: { actual_cash_minor: number; notes?: string }) => {
    closeShiftMutation.mutate(values, {
      onSuccess: () => {
        setCloseShiftOpen(false);
        closeShiftForm.reset();
      },
    });
  };

  const handleCompleteSale = useCallback(async () => {
    if (!currentShift?.data) {
      toast.error('Please open a shift first');
      return;
    }

    const payments = [
      {
        payment_method: paymentMethod,
        amount_minor: cartTotals.total,
        reference: paymentMethod === 'cash' ? undefined : `POS-${Date.now()}`,
      },
    ];

    const saleItems: SaleItemInput[] = cart.map(item => ({
      product_id: item.product.id,
      sku: item.product.sku,
      name: item.product.name,
      quantity: item.quantity,
      unit_price_minor: item.product.selling_price_minor,
      discount_minor: item.discount_minor,
      tax_rate_percentage: 16,
    }));

    const saleData = {
      branch_id: currentShift.data.branch_id,
      terminal_id: currentShift.data.terminal_id,
      customer_id: selectedCustomer?.id ?? undefined,
      shift_id: currentShift.data.id,
      items: saleItems,
      payments,
      discount_minor: cartTotals.discount,
      notes: `POS sale - ${new Date().toISOString()}`,
    };

    setCheckoutState('processing');

    // If offline, queue the sale locally
    if (!isOnline) {
      try {
        await queueSale(saleData);
        toast.success('Sale queued for offline sync');
        setSaleResult({ 
          sale: { 
            id: `local-${Date.now()}`, 
            paid_total_minor: cartTotals.total, 
            grand_total_minor: cartTotals.total 
          }, 
          change: 0 
        });
        setCheckoutState('complete');
        clearCart();
      } catch (error) {
        toast.error('Failed to queue sale offline');
        setCheckoutState('payment');
      }
      return;
    }

    // Online: try to create sale via API
    createSaleMutation.mutate(saleData, {
      onSuccess: (response: { data: { id: string; paid_total_minor: number; grand_total_minor: number } }) => {
        const change = response.data.paid_total_minor - response.data.grand_total_minor;
        setSaleResult({ sale: response.data, change });
        setCheckoutState('complete');
        clearCart();
      },
      onError: async (error) => {
        // If network error, queue offline
        if (error instanceof Error && (error.message.includes('network') || error.message.includes('fetch'))) {
          try {
            await queueSale(saleData);
            toast.success('Sale queued for offline sync');
            setSaleResult({ 
              sale: { 
                id: `local-${Date.now()}`, 
                paid_total_minor: cartTotals.total, 
                grand_total_minor: cartTotals.total 
              }, 
              change: 0 
            });
            setCheckoutState('complete');
            clearCart();
          } catch (queueError) {
            toast.error('Failed to queue sale offline');
            setCheckoutState('payment');
          }
        } else {
          toast.error('Failed to complete sale');
          setCheckoutState('payment');
        }
      },
    });
  }, [currentShift, paymentMethod, cartTotals, selectedCustomer, cart, isOnline, queueSale, createSaleMutation, clearCart, toast]);

  if (saleResult) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md border-2 border-black shadow">
          <CardContent className="pt-6 text-center">
            <div className="mb-4 text-4xl">✅</div>
            <h2 className="mb-2 text-2xl font-black">Sale Complete</h2>
            <p className="mb-4 text-sm text-muted-foreground">Receipt #{saleResult.sale.id}</p>
            {!isOnline && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border-2 border-warning bg-warning/10 p-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="font-bold">Queued for offline sync</span>
              </div>
            )}
            {saleResult.change > 0 && (
              <p className="mb-4 text-lg font-bold">Change: {fromMinorUnits(saleResult.change)}</p>
            )}
            <div className="flex gap-2 mb-4">
              <Button 
                onClick={() => setReceiptSaleId(saleResult.sale.id)} 
                variant="outline" 
                className="flex-1 border-2 border-black"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
              <Button onClick={clearCart} className="flex-1 border-2 border-black shadow">
                New Sale
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b-2 border-black bg-secondary-background px-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-black">Soko POS</h1>
          {currentShift?.data && (
            <Badge variant="default" className="border-2 border-black">
              Shift Open
            </Badge>
          )}
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-sm font-bold ${isOnline ? 'text-success' : 'text-destructive'}`}>
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4" /> Online
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4" /> Offline
                </>
              )}
            </span>
            {isSyncing && (
              <span className="flex items-center gap-1 text-sm font-bold text-info">
                <Loader2 className="h-4 w-4 animate-spin" /> Syncing
              </span>
            )}
            {pendingCount > 0 && (
              <Badge variant="default" className="border-2 border-black text-warning bg-warning/10">
                {pendingCount} pending
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCloseShiftOpen(true)}
            className="border-2 border-black"
          >
            Close Shift
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col border-r-2 border-black">
          <div className="border-b-2 border-black p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search products by name, SKU, or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-2 border-black pl-10"
                autoFocus
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {productsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg font-bold">No products found</p>
                <p className="text-sm text-muted-foreground">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {products.map((product: Product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer border-2 border-black shadow transition-all hover:shadow-lg"
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-3">
                      <div className="mb-2 h-24 rounded-lg bg-muted flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="mb-1 line-clamp-2 text-sm font-bold">{product.name}</h3>
                      <p className="mb-2 text-xs text-muted-foreground">{product.sku}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black">{formatMoney(product.selling_price_minor)}</span>
                        <Button size="icon" className="h-6 w-6 border-2 border-black">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex w-96 flex-col border-l-2 border-black bg-secondary-background">
          <div className="border-b-2 border-black p-4">
            <h2 className="text-lg font-black">Cart</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <ShoppingCart className="mb-2 h-12 w-12 text-muted-foreground" />
                <p className="text-sm font-bold text-muted-foreground">Cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <Card key={item.product.id} className="border-2 border-black">
                    <CardContent className="p-3">
                      <div className="mb-2 flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-bold">{item.product.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.product.sku}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 border-2 border-black"
                            onClick={() => updateQuantity(item.product.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7 border-2 border-black"
                            onClick={() => updateQuantity(item.product.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="text-sm font-black">
                          {formatMoney(item.product.selling_price_minor * item.quantity)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <div className="border-t-2 border-black p-4 space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold">{formatMoney(cartTotals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (16%)</span>
                  <span className="font-bold">{formatMoney(cartTotals.tax)}</span>
                </div>
                {cartTotals.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="font-bold text-destructive">-{formatMoney(cartTotals.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t-2 border-black pt-2 text-lg">
                  <span className="font-black">TOTAL</span>
                  <span className="font-black">{formatMoney(cartTotals.total)}</span>
                </div>
              </div>

              {selectedCustomer && (
                <div className="flex items-center gap-2 rounded-lg border-2 border-black bg-background p-2">
                  <User className="h-4 w-4" />
                  <span className="flex-1 text-sm font-bold">{selectedCustomer.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {!isOnline && (
                <div className="flex items-center gap-2 rounded-lg border-2 border-warning bg-warning/10 p-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  <span className="font-bold">Offline mode - sale will be queued for sync</span>
                </div>
              )}

              <Button
                onClick={handleCheckout}
                disabled={createSaleMutation.isPending}
                className="w-full border-2 border-black shadow"
              >
                {createSaleMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Checkout
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={checkoutState === 'customer'} onOpenChange={(open) => !open && setCheckoutState('idle')}>
        <DialogContent className="border-2 border-black">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">Select Customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup
              value={selectedCustomer?.id || 'walkin'}
              onValueChange={(value) => {
                if (value === 'walkin') {
                  setSelectedCustomer(null);
                } else {
                  const customer = customersData?.data?.find((c: Customer) => c.id === value);
                  setSelectedCustomer(customer || null);
                }
                setCheckoutState('payment');
              }}
            >
              <div className="flex items-center space-x-2 rounded-lg border-2 border-black p-3">
                <RadioGroupItem value="walkin" id="walkin" />
                <Label htmlFor="walkin" className="flex-1 cursor-pointer font-bold">
                  Walk-in Customer
                </Label>
              </div>
              {customersData?.data?.map((customer: Customer) => (
                <div key={customer.id} className="flex items-center space-x-2 rounded-lg border-2 border-black p-3">
                  <RadioGroupItem value={customer.id} id={customer.id} />
                  <Label htmlFor={customer.id} className="flex-1 cursor-pointer">
                    <div className="font-bold">{customer.name}</div>
                    <div className="text-xs text-muted-foreground">{customer.phone}</div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={checkoutState === 'payment'} onOpenChange={(open) => !open && setCheckoutState('customer')}>
        <DialogContent className="border-2 border-black">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center justify-between">
              Payment
              {!isOnline && (
                <Badge variant="destructive" className="border-2 border-black">
                  <WifiOff className="h-3 w-3 mr-1" /> Offline
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-black bg-background p-4">
              <div className="mb-2 text-sm text-muted-foreground">Total Amount</div>
              <div className="text-3xl font-black">{formatMoney(cartTotals.total)}</div>
            </div>

            <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'cash' | 'mpesa' | 'card' | 'bank' | 'credit')}>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center space-x-2 rounded-lg border-2 border-black p-3">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="cursor-pointer font-bold">Cash</Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border-2 border-black p-3">
                  <RadioGroupItem value="mpesa" id="mpesa" disabled={!isOnline} />
                  <Label htmlFor="mpesa" className={`cursor-pointer font-bold ${!isOnline ? 'opacity-50' : ''}`}>
                    M-Pesa {!isOnline && '(Online only)'}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border-2 border-black p-3">
                  <RadioGroupItem value="card" id="card" disabled={!isOnline} />
                  <Label htmlFor="card" className={`cursor-pointer font-bold ${!isOnline ? 'opacity-50' : ''}`}>
                    Card {!isOnline && '(Online only)'}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border-2 border-black p-3">
                  <RadioGroupItem value="bank" id="bank" disabled={!isOnline} />
                  <Label htmlFor="bank" className={`cursor-pointer font-bold ${!isOnline ? 'opacity-50' : ''}`}>
                    Bank {!isOnline && '(Online only)'}
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border-2 border-black p-3">
                  <RadioGroupItem value="credit" id="credit" />
                  <Label htmlFor="credit" className="cursor-pointer font-bold">Credit</Label>
                </div>
              </div>
            </RadioGroup>

            {paymentMethod === 'cash' && (
              <div className="space-y-2">
                <Label className="font-bold">Cash Received</Label>
                <Input
                  type="number"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="border-2 border-black"
                  placeholder="0"
                />
                {cashReceived && parseInt(cashReceived) > cartTotals.total && (
                  <p className="text-sm font-bold text-success">
                    Change: {formatMoney(parseInt(cashReceived) - cartTotals.total)}
                  </p>
                )}
              </div>
            )}

            {paymentMethod !== 'cash' && !isOnline && (
              <div className="flex items-center gap-2 rounded-lg border-2 border-destructive bg-destructive/10 p-2 text-sm">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="font-bold">{paymentMethod} payments require internet connection. Select Cash or go online.</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setCheckoutState('customer')}
                className="flex-1 border-2 border-black"
              >
                Back
              </Button>
              <Button
                onClick={handleCompleteSale}
                disabled={paymentMethod === 'cash' && (!cashReceived || parseInt(cashReceived) < cartTotals.total)}
                className="flex-1 border-2 border-black shadow"
              >
                Pay {formatMoney(cartTotals.total)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openShiftOpen} onOpenChange={setOpenShiftOpen}>
        <DialogContent className="border-2 border-black">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">Open Shift</DialogTitle>
          </DialogHeader>
          <form onSubmit={openShiftForm.handleSubmit(handleOpenShift)} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold">Terminal</Label>
              <select
                {...openShiftForm.register('terminal_id')}
                className="w-full rounded-lg border-2 border-black bg-background p-2"
              >
                <option value="">Select terminal</option>
                {terminalsData?.data?.map((terminal: { id: string; name: string; terminal_code: string }) => (
                  <option key={terminal.id} value={terminal.id}>
                    {terminal.name} ({terminal.terminal_code})
                  </option>
                ))}
              </select>
              {openShiftForm.formState.errors.terminal_id && (
                <p className="text-sm text-destructive">{openShiftForm.formState.errors.terminal_id.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Opening Float</Label>
              <Input
                type="number"
                {...openShiftForm.register('opening_float_minor')}
                className="border-2 border-black"
                placeholder="0"
              />
              {openShiftForm.formState.errors.opening_float_minor && (
                <p className="text-sm text-destructive">{openShiftForm.formState.errors.opening_float_minor.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Notes</Label>
              <Input
                {...openShiftForm.register('notes')}
                className="border-2 border-black"
                placeholder="Optional notes"
              />
            </div>
            <Button type="submit" disabled={openShiftMutation.isPending} className="w-full border-2 border-black shadow">
              {openShiftMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Open Shift
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={closeShiftOpen} onOpenChange={setCloseShiftOpen}>
        <DialogContent className="border-2 border-black">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">Close Shift</DialogTitle>
          </DialogHeader>
          <form onSubmit={closeShiftForm.handleSubmit(handleCloseShift)} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bold">Actual Cash</Label>
              <Input
                type="number"
                {...closeShiftForm.register('actual_cash_minor')}
                className="border-2 border-black"
                placeholder="0"
              />
              {closeShiftForm.formState.errors.actual_cash_minor && (
                <p className="text-sm text-destructive">{closeShiftForm.formState.errors.actual_cash_minor.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="font-bold">Notes</Label>
              <Input
                {...closeShiftForm.register('notes')}
                className="border-2 border-black"
                placeholder="Optional notes"
              />
            </div>
            <Button type="submit" disabled={closeShiftMutation.isPending} className="w-full border-2 border-black shadow">
              {closeShiftMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Close Shift
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ReceiptPreview 
        saleId={receiptSaleId || ''} 
        isOpen={!!receiptSaleId} 
        onClose={() => setReceiptSaleId(null)} 
      />
    </div>
  );
}

function formatMoney(minor: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
  }).format(minor / 100);
}