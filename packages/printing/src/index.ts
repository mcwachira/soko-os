/**
 * @soko/printing - Receipt printing utilities
 * 
 * Supports:
 * - Thermal printers via ESC/POS commands
 * - Browser print dialog (HTML receipt)
 * - PDF generation via jsPDF
 * - Mock/sandbox mode for development
 */

import { Sale, SaleItem, Customer, PaymentTransaction, CashShift } from '@soko/domain-types';

export interface ReceiptData {
  sale: Sale;
  businessName: string;
  branchName: string;
  terminalCode: string;
  cashierName: string;
  customer?: Customer | null;
  items: SaleItem[];
  payments: PaymentTransaction[];
  subtotalMinor: number;
  discountMinor: number;
  taxTotalMinor: number;
  grandTotalMinor: number;
  changeDueMinor: number;
  receiptNumber: string;
  createdAt: string;
}

export interface PrintOptions {
  format: 'escpos' | 'html' | 'pdf';
  paperWidth?: 58 | 80; // mm
  copies?: number;
  autoCut?: boolean;
}

export interface PrinterConnection {
  type: 'usb' | 'bluetooth' | 'network' | 'browser' | 'mock';
  deviceId?: string;
  ipAddress?: string;
  port?: number;
}

// ============================================================================
// ESC/POS Command Generator
// ============================================================================

export class EscPosGenerator {
  private commands: string[] = [];

  static generate(receipt: ReceiptData, options: { paperWidth: 58 | 80; autoCut: boolean } = { paperWidth: 80, autoCut: true }): string {
    const generator = new EscPosGenerator();
    return generator.build(receipt, options);
  }

  private build(receipt: ReceiptData, options: { paperWidth: 58 | 80; autoCut: boolean }): string {
    const width = options.paperWidth === 58 ? 32 : 48; // character columns
    
    this.init();
    this.center();
    this.bold(true);
    this.text(receipt.businessName);
    this.bold(false);
    this.text(receipt.branchName);
    this.text(`Terminal: ${receipt.terminalCode}`);
    this.line(width);
    this.left();
    
    this.text(`Receipt: ${receipt.receiptNumber}`);
    this.text(`Date: ${new Date(receipt.createdAt).toLocaleString()}`);
    this.text(`Cashier: ${receipt.cashierName}`);
    
    if (receipt.customer) {
      this.text(`Customer: ${receipt.customer.name}`);
      if (receipt.customer.phone) {
        this.text(`Phone: ${receipt.customer.phone}`);
      }
    }
    
    this.line(width);
    this.text(this.formatRow('Item', 'Qty', 'Price', 'Total', width));
    this.line(width);
    
    for (const item of receipt.items) {
      const name = this.truncate(item.name, width - 20);
      this.text(this.formatRow(name, item.quantity.toString(), this.formatMoney(item.unit_price_minor), this.formatMoney(item.total_minor), width));
      
      if (item.tax_amount_minor > 0) {
        this.text(`  VAT ${item.tax_rate_percentage}%: ${this.formatMoney(item.tax_amount_minor)}`);
      }
    }
    
    this.line(width);
    this.text(this.formatTotal('Subtotal:', this.formatMoney(receipt.subtotalMinor), width));
    
    if (receipt.discountMinor > 0) {
      this.text(this.formatTotal('Discount:', `-${this.formatMoney(receipt.discountMinor)}`, width));
    }
    
    this.text(this.formatTotal('Tax:', this.formatMoney(receipt.taxTotalMinor), width));
    
    this.bold(true);
    this.text(this.formatTotal('TOTAL:', this.formatMoney(receipt.grandTotalMinor), width));
    this.bold(false);
    
    this.line(width);
    const paymentMethods = [...new Set(receipt.payments.map(p => p.payment_method))].map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ');
    this.text(`Paid by: ${paymentMethods}`);
    
    if (receipt.changeDueMinor > 0) {
      this.text(`Change: ${this.formatMoney(receipt.changeDueMinor)}`);
    }
    
    this.doubleLine(width);
    this.center();
    this.text('VAT Inclusive');
    this.text('---');
    this.text('Thank you for shopping!');
    this.text('Visit us again!');
    this.feed(4);
    
    if (options.autoCut) {
      this.cut();
    }
    
    return this.commands.join('');
  }

  private init(): void {
    this.commands.push('\x1B\x40'); // ESC @ - Initialize
  }

  private center(): void {
    this.commands.push('\x1B\x61\x01'); // ESC a 1 - Center
  }

  private left(): void {
    this.commands.push('\x1B\x61\x00'); // ESC a 0 - Left
  }

  private bold(on: boolean): void {
    this.commands.push(on ? '\x1B\x45\x01' : '\x1B\x45\x00');
  }

  private text(text: string): void {
    this.commands.push(text + '\x0A');
  }

  private line(width: number): void {
    this.commands.push('-'.repeat(width) + '\x0A');
  }

  private doubleLine(width: number): void {
    this.commands.push('='.repeat(width) + '\x0A');
  }

  private formatMoney(minor: number): string {
    return (minor / 100).toFixed(2);
  }

  private truncate(str: string, maxLen: number): string {
    return str.length > maxLen ? str.substring(0, maxLen - 3) + '...' : str;
  }

  private formatRow(item: string, qty: string, price: string, total: string, width: number): string {
    const itemWidth = width - 20;
    const qtyWidth = 4;
    const priceWidth = 8;
    const totalWidth = 8;
    return `${item.padEnd(itemWidth)} ${qty.padStart(qtyWidth)} ${price.padStart(priceWidth)} ${total.padStart(totalWidth)}`;
  }

  private formatTotal(label: string, value: string, width: number): string {
    const labelWidth = width - 12;
    return `${label.padEnd(labelWidth)} ${value.padStart(12)}`;
  }

  private feed(lines: number): void {
    for (let i = 0; i < lines; i++) {
      this.commands.push('\x0A');
    }
  }

  private cut(): void {
    this.commands.push('\x1D\x56\x41\x00'); // GS V A 0 - Partial cut
  }
}

// ============================================================================
// HTML Receipt Generator (for browser print)
// ============================================================================

export class HtmlReceiptGenerator {
  static generate(receipt: ReceiptData): string {
    const formatMoney = (minor: number) => (minor / 100).toFixed(2);
    const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString();

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt - ${receipt.receiptNumber}</title>
  <style>
    @media print {
      @page { margin: 0; size: ${receipt.items.length > 10 ? '80mm auto' : '80mm 150mm'}; }
      body { margin: 0; padding: 10px; }
      .no-print { display: none; }
    }
    body {
      font-family: "Courier New", "Monospace", monospace;
      font-size: 12px;
      line-height: 1.4;
      max-width: 80mm;
      margin: 0 auto;
      padding: 10px;
    }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .large { font-size: 16px; font-weight: bold; }
    .right { text-align: right; }
    .left { text-align: left; }
    hr { border: 0; border-top: 1px dashed #000; margin: 5px 0; }
    .items-table { width: 100%; border-collapse: collapse; font-size: 11px; }
    .items-table td { padding: 2px 0; }
    .items-table .qty { text-align: right; width: 40px; }
    .items-table .price { text-align: right; width: 60px; }
    .items-table .total { text-align: right; width: 70px; }
    .totals { font-size: 12px; }
    .totals .label { display: inline-block; width: 60%; }
    .totals .value { display: inline-block; width: 40%; text-align: right; }
    .total-row { font-size: 16px; font-weight: bold; }
    .payment-info { margin-top: 10px; font-size: 11px; }
    .qr-placeholder { width: 100px; height: 100px; margin: 10px auto; border: 1px solid #000; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #666; }
    button { margin: 10px 5px; padding: 8px 16px; font-size: 14px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: center; margin-bottom: 20px;">
    <button onclick="window.print()">Print Receipt</button>
    <button onclick="downloadPdf()">Download PDF</button>
  </div>
  
  <div class="center">
    <div class="bold large">${receipt.businessName}</div>
    <div>${receipt.branchName}</div>
    <div>Terminal: ${receipt.terminalCode}</div>
  </div>
  <hr>
  <div class="left">
    <div>Receipt: ${receipt.receiptNumber}</div>
    <div>Date: ${formatDate(receipt.createdAt)}</div>
    <div>Cashier: ${receipt.cashierName}</div>
    ${receipt.customer ? `<div>Customer: ${receipt.customer.name}</div>` : ''}
    ${receipt.customer?.phone ? `<div>Phone: ${receipt.customer.phone}</div>` : ''}
  </div>
  <hr>
  <table class="items-table">
    <thead>
      <tr>
        <td style="width: 45%">Item</td>
        <td class="qty">Qty</td>
        <td class="price">Price</td>
        <td class="total">Total</td>
      </tr>
    </thead>
    <tbody>
      ${receipt.items.map(item => `
        <tr>
          <td>${this.escapeHtml(item.name)}</td>
          <td class="qty">${item.quantity}</td>
          <td class="price">${formatMoney(item.unit_price_minor)}</td>
          <td class="total">${formatMoney(item.total_minor)}</td>
        </tr>
        ${item.tax_amount_minor > 0 ? `
          <tr><td colspan="4" style="font-size: 10px; color: #666;">  VAT ${item.tax_rate_percentage}%: ${formatMoney(item.tax_amount_minor)}</td></tr>
        ` : ''}
      `).join('')}
    </tbody>
  </table>
  <hr>
  <div class="totals">
    <div><span class="label">Subtotal:</span><span class="value">${formatMoney(receipt.subtotalMinor)}</span></div>
    ${receipt.discountMinor > 0 ? `<div><span class="label">Discount:</span><span class="value">-${formatMoney(receipt.discountMinor)}</span></div>` : ''}
    <div><span class="label">Tax:</span><span class="value">${formatMoney(receipt.taxTotalMinor)}</span></div>
    <div class="total-row"><span class="label">TOTAL:</span><span class="value">${formatMoney(receipt.grandTotalMinor)}</span></div>
  </div>
  <hr>
  <div class="payment-info">
    <div>Paid by: ${[...new Set(receipt.payments.map(p => p.payment_method))].map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')}</div>
    ${receipt.changeDueMinor > 0 ? `<div>Change: ${formatMoney(receipt.changeDueMinor)}</div>` : ''}
  </div>
  <hr>
  <div class="center">
    <div class="qr-placeholder">QR Code / KRA TIM</div>
    <div>VAT Inclusive</div>
    <br>
    <div class="bold">Thank you for shopping!</div>
    <div>Visit us again!</div>
  </div>

  <script>
    function downloadPdf() {
      // Trigger PDF download via jsPDF if available
      if (typeof window.generatePdf === 'function') {
        window.generatePdf();
      }
    }
  </script>
</body>
</html>`;
  }

  private static escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&',
      '<': '<',
      '>': '>',
      '"': '"',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

// ============================================================================
// PDF Generator (requires jsPDF)
// ============================================================================

export class PdfReceiptGenerator {
  static async generate(receipt: ReceiptData): Promise<Blob> {
    // Dynamic import to avoid bundling jsPDF if not used
    const { jsPDF } = await import('jspdf');
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 150 + receipt.items.length * 5] // Dynamic height
    });

    const formatMoney = (minor: number) => (minor / 100).toFixed(2);
    let y = 10;

    // Header
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(receipt.businessName, 40, y, { align: 'center' });
    y += 6;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.branchName, 40, y, { align: 'center' });
    y += 5;
    doc.text(`Terminal: ${receipt.terminalCode}`, 40, y, { align: 'center' });
    y += 5;

    doc.line(5, y, 75, y);
    y += 5;

    // Receipt info
    doc.setFontSize(9);
    doc.text(`Receipt: ${receipt.receiptNumber}`, 5, y);
    y += 4;
    doc.text(`Date: ${new Date(receipt.createdAt).toLocaleString()}`, 5, y);
    y += 4;
    doc.text(`Cashier: ${receipt.cashierName}`, 5, y);
    y += 4;

    if (receipt.customer) {
      doc.text(`Customer: ${receipt.customer.name}`, 5, y);
      y += 4;
      if (receipt.customer.phone) {
        doc.text(`Phone: ${receipt.customer.phone}`, 5, y);
        y += 4;
      }
    }

    doc.line(5, y, 75, y);
    y += 5;

    // Items table
    doc.setFontSize(8);
    doc.text('Item', 5, y);
    doc.text('Qty', 50, y, { align: 'right' });
    doc.text('Price', 60, y, { align: 'right' });
    doc.text('Total', 75, y, { align: 'right' });
    y += 4;
    doc.line(5, y, 75, y);
    y += 3;

    for (const item of receipt.items) {
      const name = item.name.length > 20 ? item.name.substring(0, 17) + '...' : item.name;
      doc.text(name, 5, y);
      doc.text(item.quantity.toString(), 50, y, { align: 'right' });
      doc.text(formatMoney(item.unit_price_minor), 60, y, { align: 'right' });
      doc.text(formatMoney(item.total_minor), 75, y, { align: 'right' });
      y += 4;

      if (item.tax_amount_minor > 0) {
        doc.setFontSize(7);
        doc.text(`  VAT ${item.tax_rate_percentage}%: ${formatMoney(item.tax_amount_minor)}`, 5, y);
        doc.setFontSize(8);
        y += 3;
      }
    }

    doc.line(5, y, 75, y);
    y += 4;

    // Totals
    doc.setFontSize(9);
    doc.text('Subtotal:', 5, y);
    doc.text(formatMoney(receipt.subtotalMinor), 75, y, { align: 'right' });
    y += 5;

    if (receipt.discountMinor > 0) {
      doc.text('Discount:', 5, y);
      doc.text(`-${formatMoney(receipt.discountMinor)}`, 75, y, { align: 'right' });
      y += 5;
    }

    doc.text('Tax:', 5, y);
    doc.text(formatMoney(receipt.taxTotalMinor), 75, y, { align: 'right' });
    y += 5;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 5, y);
    doc.text(formatMoney(receipt.grandTotalMinor), 75, y, { align: 'right' });
    y += 8;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.line(5, y, 75, y);
    y += 5;

    const paymentMethods = [...new Set(receipt.payments.map(p => p.payment_method))].map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ');
    doc.text(`Paid by: ${paymentMethods}`, 5, y);
    y += 5;

    if (receipt.changeDueMinor > 0) {
      doc.text(`Change: ${formatMoney(receipt.changeDueMinor)}`, 5, y);
      y += 5;
    }

    doc.line(5, y, 75, y);
    y += 5;

    doc.setFontSize(8);
    doc.text('VAT Inclusive', 40, y, { align: 'center' });
    y += 5;

    // QR Code placeholder
    doc.rect(30, y, 20, 20);
    doc.setFontSize(7);
    doc.text('QR Code', 40, y + 10, { align: 'center' });
    y += 25;

    doc.text('Thank you for shopping!', 40, y, { align: 'center' });
    y += 5;
    doc.text('Visit us again!', 40, y, { align: 'center' });

    return doc.output('blob');
  }
}

// ============================================================================
// Printer Interface
// ============================================================================

export interface IPrinter {
  readonly name: string;
  readonly connection: PrinterConnection;
  
  print(data: string | Uint8Array): Promise<PrintResult>;
  isConnected(): Promise<boolean>;
  disconnect(): Promise<void>;
}

export interface PrintResult {
  success: boolean;
  jobId?: string;
  error?: string;
}

// ============================================================================
// Mock Printer (for development/testing)
// ============================================================================

export class MockPrinter implements IPrinter {
  readonly name = 'Mock Printer (Development)';
  readonly connection: PrinterConnection = { type: 'mock' };

  async print(data: string | Uint8Array): Promise<PrintResult> {
    console.log('[MockPrinter] Printing:', typeof data === 'string' ? data.substring(0, 200) : '<binary data>');
    return { success: true, jobId: `mock-${Date.now()}` };
  }

  async isConnected(): Promise<boolean> {
    return true;
  }

  async disconnect(): Promise<void> {
    console.log('[MockPrinter] Disconnected');
  }
}

// ============================================================================
// Browser Print Helper
// ============================================================================

export class BrowserPrinter {
  static async printHtml(html: string): Promise<PrintResult> {
    return new Promise((resolve) => {
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (!printWindow) {
        resolve({ success: false, error: 'Popup blocked' });
        return;
      }

      printWindow.document.write(html);
      printWindow.document.close();

      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        
        // Close after print dialog
        printWindow.onafterprint = () => {
          printWindow.close();
          resolve({ success: true, jobId: `browser-${Date.now()}` });
        };

        // Fallback timeout
        setTimeout(() => {
          printWindow.close();
          resolve({ success: true, jobId: `browser-${Date.now()}` });
        }, 10000);
      };
    });
  }

  static async printPdf(pdfBlob: Blob): Promise<PrintResult> {
    const url = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(url, '_blank');
    if (!printWindow) {
      URL.revokeObjectURL(url);
      return { success: false, error: 'Popup blocked' };
    }

    return new Promise((resolve) => {
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        printWindow.onafterprint = () => {
          printWindow.close();
          URL.revokeObjectURL(url);
          resolve({ success: true, jobId: `pdf-${Date.now()}` });
        };
      };
    });
  }
}

// ============================================================================
// Receipt Printing Service
// ============================================================================

export interface ReceiptServiceConfig {
  defaultPrinter?: IPrinter;
  fallbackPrinter?: IPrinter;
  defaultOptions?: PrintOptions;
}

export class ReceiptService {
  private config: ReceiptServiceConfig;

  constructor(config: ReceiptServiceConfig = {}) {
    this.config = {
      defaultPrinter: config.defaultPrinter || new MockPrinter(),
      fallbackPrinter: config.fallbackPrinter || new MockPrinter(),
      defaultOptions: { format: 'html', paperWidth: 80, copies: 1, autoCut: true, ...config.defaultOptions }
    };
  }

  async printReceipt(receipt: ReceiptData, options?: PrintOptions, printer?: IPrinter): Promise<PrintResult> {
    const opts = { ...this.config.defaultOptions, ...options };
    const targetPrinter = printer || this.config.defaultPrinter;

    try {
      let printData: string | Uint8Array;

      switch (opts.format) {
        case 'escpos':
          printData = EscPosGenerator.generate(receipt, { paperWidth: opts.paperWidth || 80, autoCut: opts.autoCut ?? true });
          break;
        case 'html':
          printData = HtmlReceiptGenerator.generate(receipt);
          return BrowserPrinter.printHtml(printData);
        case 'pdf':
          const pdfBlob = await PdfReceiptGenerator.generate(receipt);
          return BrowserPrinter.printPdf(pdfBlob);
        default:
          throw new Error(`Unsupported format: ${opts.format}`);
      }

      return await targetPrinter.print(printData);
    } catch (error) {
      console.error('Print failed, trying fallback:', error);
      return this.config.fallbackPrinter!.print(
        EscPosGenerator.generate(receipt, { paperWidth: opts.paperWidth || 80, autoCut: opts.autoCut ?? true })
      );
    }
  }

  async printEscPos(receipt: ReceiptData, printer?: IPrinter): Promise<PrintResult> {
    return this.printReceipt(receipt, { format: 'escpos' }, printer);
  }

  async printHtml(receipt: ReceiptData): Promise<PrintResult> {
    return this.printReceipt(receipt, { format: 'html' });
  }

  async printPdf(receipt: ReceiptData): Promise<PrintResult> {
    return this.printReceipt(receipt, { format: 'pdf' });
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

export function createReceiptData(
  sale: Sale,
  businessName: string,
  branchName: string,
  terminalCode: string,
  cashierName: string,
  customer: Customer | null,
  items: SaleItem[],
  payments: PaymentTransaction[]
): ReceiptData {
  return {
    sale,
    businessName,
    branchName,
    terminalCode,
    cashierName,
    customer,
    items,
    payments,
    subtotalMinor: sale.subtotal_minor,
    discountMinor: sale.discount_minor,
    taxTotalMinor: sale.tax_total_minor,
    grandTotalMinor: sale.grand_total_minor,
    changeDueMinor: sale.change_due_minor,
    receiptNumber: sale.receipt_number,
    createdAt: sale.created_at
  };
}

export function createMockReceiptService(): ReceiptService {
  return new ReceiptService({
    defaultPrinter: new MockPrinter(),
    fallbackPrinter: new MockPrinter(),
    defaultOptions: { format: 'html', paperWidth: 80, copies: 1, autoCut: true }
  });
}