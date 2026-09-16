"use client";

import { useState, useEffect } from "react";
import { getReceipt } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { Printer, Download, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReceiptPreviewProps {
  saleId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptPreview({ saleId, isOpen, onClose }: ReceiptPreviewProps) {
  const { token } = useAuth();
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [escposContent, setEscposContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"html" | "escpos">("html");
  const [printSuccess, setPrintSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && saleId) {
      loadReceipt();
    }
  }, [isOpen, saleId]);

  const loadReceipt = async () => {
    setIsLoading(true);
    try {
      const htmlBlob = await getReceipt(() => token,
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
        saleId, "html"
      );
      const htmlText = await htmlBlob.text();
      setHtmlContent(htmlText);

      const escposBlob = await getReceipt(() => token,
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
        saleId, "escpos"
      );
      const escposText = await escposBlob.text();
      setEscposContent(escposText);
    } catch (error) {
      console.error("Failed to load receipt:", error);
      toast.error("Failed to load receipt");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = async () => {
    if (activeTab === "html") {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        setPrintSuccess(true);
        setTimeout(() => setPrintSuccess(false), 2000);
      }
    } else {
      toast.info("ESC/POS printing requires thermal printer integration");
    }
  };

  const handleDownload = async () => {
    const content = activeTab === "html" ? htmlContent : escposContent;
    const extension = activeTab === "html" ? "html" : "txt";
    const blob = new Blob([content], { type: activeTab === "html" ? "text/html" : "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "receipt-" + saleId + "." + extension;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-2 border-black max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-lg font-black flex items-center justify-between">
            Receipt Preview
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="border-2 border-black"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button
                onClick={handlePrint}
                disabled={isLoading}
                className="border-2 border-black shadow"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex border-b-2 border-black">
            <button
              onClick={() => setActiveTab("html")}
              className={`flex-1 py-2 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === "html" ? "border-black text-foreground" : "border-transparent text-muted-foreground"}`}
            >
              HTML
            </button>
            <button
              onClick={() => setActiveTab("escpos")}
              className={`flex-1 py-2 px-4 text-sm font-bold border-b-2 transition-colors ${activeTab === "escpos" ? "border-black text-foreground" : "border-transparent text-muted-foreground"}`}
            >
              ESC/POS
            </button>
          </div>

          <div className="max-h-[60vh] overflow-auto p-4 bg-background border-2 border-black rounded-lg">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : activeTab === "html" ? (
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            ) : (
              <pre className="font-mono text-sm whitespace-pre-wrap text-green-800 bg-black p-4 rounded">
                {escposContent}
              </pre>
            )}
          </div>

          {printSuccess && (
            <div className="flex items-center gap-2 text-green-700 text-sm font-bold">
              <CheckCircle className="h-4 w-4" />
              Sent to printer
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
