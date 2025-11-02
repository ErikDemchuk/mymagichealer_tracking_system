"use client"

import { generateBoxId, formatBoxIdForPrint } from '@/lib/box-id-generator'
import { QRCodeSVG } from 'qrcode.react'

interface BoxLabelData {
  boxId: string
  productType: string
  size: string
  unitCount: number
  batch: string
  createdDate: string
}

interface BoxLabelProps {
  data: BoxLabelData
  className?: string
}

/**
 * Printable box label component
 * Generates a label with box ID, QR code, and product information
 */
export function BoxLabel({ data, className }: BoxLabelProps) {
  const { boxId, productType, size, unitCount, batch, createdDate } = data
  const formattedBoxId = formatBoxIdForPrint(boxId)
  
  // Generate QR code data (URL to box details)
  const qrCodeData = `${window.location.origin}/dashboard/box/${boxId}`

  return (
    <div
      className={`bg-white border-2 border-black p-4 w-[4in] h-[3in] flex flex-col ${className}`}
      style={{ printColorAdjust: 'exact' }}
    >
      {/* Header with Box ID */}
      <div className="border-b-2 border-black pb-2 mb-2">
        <h1 className="text-2xl font-bold text-center">{formattedBoxId}</h1>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4">
        {/* Left Side - QR Code */}
        <div className="flex items-center justify-center">
          <QRCodeSVG
            value={qrCodeData}
            size={120}
            level="M"
            includeMargin={false}
          />
        </div>

        {/* Right Side - Product Info */}
        <div className="flex-1 flex flex-col justify-center space-y-2">
          <div>
            <div className="text-xs font-semibold text-gray-600">PRODUCT</div>
            <div className="text-lg font-bold">{productType}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs font-semibold text-gray-600">SIZE</div>
              <div className="text-base font-bold">{size}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-600">UNITS</div>
              <div className="text-base font-bold">{unitCount}</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-gray-600">BATCH</div>
            <div className="text-base font-bold">{batch}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-black pt-2 mt-2 text-xs text-center text-gray-600">
        <div>Created: {createdDate}</div>
        <div className="mt-1">MyMagicHealer Production</div>
      </div>
    </div>
  )
}

/**
 * Print multiple box labels
 */
interface PrintBoxLabelsProps {
  labels: BoxLabelData[]
}

export function PrintBoxLabels({ labels }: PrintBoxLabelsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {labels.map((labelData) => (
        <BoxLabel key={labelData.boxId} data={labelData} />
      ))}
    </div>
  )
}

/**
 * Label generator hook
 */
export function useLabelGenerator() {
  const generateLabel = (
    productType: string,
    size: string,
    unitCount: number,
    batch: string
  ): BoxLabelData => {
    const boxId = generateBoxId()
    const createdDate = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    return {
      boxId,
      productType,
      size,
      unitCount,
      batch,
      createdDate,
    }
  }

  const printLabel = (labelData: BoxLabelData) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    // Generate HTML for printing
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Label - ${labelData.boxId}</title>
          <style>
            @media print {
              @page {
                size: 4in 3in;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
            }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script>
            window.onload = () => {
              window.print()
              window.close()
            }
          </script>
        </body>
      </html>
    `

    printWindow.document.write(html)
    printWindow.document.close()
  }

  return {
    generateLabel,
    printLabel,
  }
}

