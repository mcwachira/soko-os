'use client';

import { useState, useCallback, useEffect } from 'react';
import { db } from '@soko/offline';
import { v4 as uuidv4 } from 'uuid';
import type { Sale, SaleItem, PaymentTransaction, Product, Customer } from '@soko/domain-types';

export interface QueuedSale {
  id: string;
  local_id: string;
  idempotency_key: string;
  data: {
    branch_id: string;
    terminal_id?: string;
    customer_id?: string;
    shift_id?: string;
    items: Array<{
      product_id: string;
      sku: string;
      name: string;
      quantity: number;
      unit_price_minor: number;
      discount_minor: number;
      tax_rate_percentage: number;
    }>;
    payments: Array<{
      payment_method: string;
      amount_minor: number;
      reference?: string;
    }>;
    discount_minor: number;
    notes?: string;
  };
  created_at: string;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  retry_count: number;
  error?: string;
}

export function useOfflineSale() {
  const [queuedSales, setQueuedSales] = useState<QueuedSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQueuedSales();
  }, []);

  const loadQueuedSales = useCallback(async () => {
    try {
      const sales = await db.sales
        .where('sync_status')
        .anyOf(['pending', 'failed'])
        .toArray();
      
      // Get idempotency keys from sync_operations
      const operations = await db.sync_operations
        .where('entity_name')
        .equals('sales')
        .toArray();
      
      const idempotencyMap = new Map(operations.map(op => [op.local_id, op.idempotency_key]));
      
      setQueuedSales(sales.map(sale => ({
        id: sale.id,
        local_id: sale.local_id || sale.id,
        idempotency_key: idempotencyMap.get(sale.local_id || sale.id) || '',
        data: sale as any,
        created_at: sale.created_at,
        status: sale.sync_status === 'pending' ? 'pending' : 
                sale.sync_status === 'synced' ? 'completed' : 'failed',
        retry_count: 0,
      })));
    } catch (error) {
      console.error('Failed to load queued sales:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const queueSale = useCallback(async (saleData: QueuedSale['data']): Promise<string> => {
    const localId = uuidv4();
    const idempotencyKey = `sale-${localId}-${Date.now()}`;

    const queuedSale: QueuedSale = {
      id: localId,
      local_id: localId,
      idempotency_key: idempotencyKey,
      data: saleData,
      created_at: new Date().toISOString(),
      status: 'pending',
      retry_count: 0,
    };

    try {
      await db.sales.put({
        ...saleData,
        id: localId,
        local_id: localId,
        idempotency_key: idempotencyKey,
        sync_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any);

      // Also queue the sync operation
      await db.sync_operations.put({
        operation_id: uuidv4(),
        idempotency_key: idempotencyKey,
        entity_name: 'sales',
        action: 'create',
        local_id: localId,
        data: saleData,
        created_at: new Date().toISOString(),
      });

      setQueuedSales(prev => [...prev, queuedSale]);
      return localId;
    } catch (error) {
      console.error('Failed to queue sale:', error);
      throw error;
    }
  }, []);

  const updateSaleStatus = useCallback(async (
    localId: string, 
    status: QueuedSale['status'], 
    error?: string
  ) => {
    try {
      const sale = await db.sales.get(localId);
      if (sale) {
        await db.sales.update(localId, {
          sync_status: status === 'pending' ? 'pending' : 
                       status === 'completed' ? 'synced' : 'failed',
          updated_at: new Date().toISOString(),
        });
      }

      setQueuedSales(prev => prev.map(sale => 
        sale.local_id === localId 
          ? { ...sale, status, error }
          : sale
      ));
    } catch (error) {
      console.error('Failed to update sale status:', error);
    }
  }, []);

  const removeQueuedSale = useCallback(async (localId: string) => {
    try {
      await db.sales.delete(localId);
      setQueuedSales(prev => prev.filter(sale => sale.local_id !== localId));
    } catch (error) {
      console.error('Failed to remove queued sale:', error);
    }
  }, []);

  const getPendingCount = useCallback(async () => {
    try {
      return await db.sales.where('sync_status').anyOf(['pending', 'failed']).count();
    } catch {
      return 0;
    }
  }, []);

  return {
    queuedSales,
    isLoading,
    queueSale,
    updateSaleStatus,
    removeQueuedSale,
    getPendingCount,
    refresh: loadQueuedSales,
  };
}
