export default {
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    // ── Reseller Information (Account owner who placed the order) ──
    {
      name: 'resellerEmail',
      title: 'Reseller Email',
      type: 'string',
      validation: (Rule: any) => 
        Rule.required()
          .regex(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            'Please enter a valid email address'
          )
          .error('Valid reseller email is required'),
    },
    {
      name: 'resellerId',
      title: 'Reseller ID',
      type: 'string',
      description: 'Supabase user ID of the reseller',
      readOnly: true,
    },
    {
      name: 'resellerName',
      title: 'Reseller Name',
      type: 'string',
      readOnly: true,
    },
    
    // ── Buyer Information (Customer receiving the order) ──
    {
      name: 'customerName',
      title: 'Customer Name',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'buyerEmail',
      title: 'Buyer Email',
      type: 'string',
      description: 'Email of the person receiving the order (same as reseller email for direct orders)',
    },
    {
      name: 'phoneNumber',
      title: 'Phone Number',
      type: 'string',
      validation: (Rule: any) => Rule.required().min(10),
    },
    {
      name: 'alternatePhone',
      title: 'Alternate Phone',
      type: 'string',
    },
    {
      name: 'instagramId',
      title: 'Instagram ID',
      type: 'string',
    },
    {
      name: 'address',
      title: 'Address',
      type: 'text',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'district',
      title: 'District',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'state',
      title: 'State',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'pincode',
      title: 'Pincode',
      type: 'string',
      validation: (Rule: any) => Rule.required().length(6),
    },
    {
      name: 'landmark',
      title: 'Landmark',
      type: 'string',
    },
    
    // ── Order Items ──
    {
      name: 'products',
      title: 'Ordered Products',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'product',
              title: 'Product',
              type: 'reference',
              to: [{ type: 'product' }],
              validation: (Rule: any) => Rule.required(),
            },
            {
              name: 'quantity',
              title: 'Quantity',
              type: 'number',
              validation: (Rule: any) => Rule.required().min(1),
            },
            {
              name: 'size',
              title: 'Selected Size',
              type: 'string',
            },
            {
              name: 'color',
              title: 'Selected Color',
              type: 'string',
            },
            {
              name: 'price',
              title: 'Price at time of order',
              type: 'number',
              description: 'Product price when ordered',
            },
          ],
          preview: {
            select: {
              title: 'product.name',
              quantity: 'quantity',
              size: 'size',
              color: 'color',
            },
            prepare({ title, quantity, size, color }: any) {
              const details = [size && `Size: ${size}`, color && `Color: ${color}`]
                .filter(Boolean)
                .join(' • ');
              return {
                title: title || 'Unknown Product',
                subtitle: `Qty: ${quantity}${details ? ` • ${details}` : ''}`,
              };
            },
          },
        },
      ],
      validation: (Rule: any) => Rule.required().min(1),
    },
    
    // ── Payment Information ──
    {
      name: 'paymentMode',
      title: 'Payment Mode',
      type: 'string',
      options: {
        list: [
          { title: 'Online Payment', value: 'online' },
          { title: 'Cash on Delivery', value: 'cod' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'paymentStatus',
      title: 'Payment Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Paid', value: 'paid' },
          { title: 'Failed', value: 'failed' },
          { title: 'Refunded', value: 'refunded' },
        ],
      },
      initialValue: 'pending',
    },
    {
      name: 'transactionId',
      title: 'Transaction ID',
      type: 'string',
      description: 'UPI transaction reference number',
    },
    {
      name: 'advanceAmount',
      title: 'Advance Amount',
      type: 'number',
      description: 'Amount paid in advance (for COD orders)',
    },
    {
      name: 'codRemaining',
      title: 'COD Remaining Amount',
      type: 'number',
      description: 'Amount to be collected on delivery',
    },
    {
      name: 'shippingCharges',
      title: 'Shipping Charges',
      type: 'number',
      initialValue: 0,
    },
    {
      name: 'totalAmount',
      title: 'Total Amount',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(0),
    },
    
    // ── Order Status & Tracking ──
    {
      name: 'orderStatus',
      title: 'Order Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Processing', value: 'processing' },
          { title: 'Shipped', value: 'shipped' },
          { title: 'Delivered', value: 'delivered' },
          { title: 'Cancelled', value: 'cancelled' },
          { title: 'Refunded', value: 'refunded' },
        ],
      },
      initialValue: 'pending',
    },
    {
      name: 'trackingNumber',
      title: 'Tracking Number',
      type: 'string',
    },
    {
      name: 'trackingUrl',
      title: 'Tracking URL',
      type: 'url',
    },
    {
      name: 'shippingProvider',
      title: 'Shipping Provider',
      type: 'string',
      options: {
        list: [
          { title: 'India Post', value: 'indiapost' },
          { title: 'Delhivery', value: 'delhivery' },
          { title: 'Blue Dart', value: 'bluedart' },
          { title: 'DTDC', value: 'dtdc' },
          { title: 'Other', value: 'other' },
        ],
      },
    },
    
    // ── Timestamps ──
    {
      name: 'orderedAt',
      title: 'Ordered At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    },
    {
      name: 'updatedAt',
      title: 'Last Updated',
      type: 'datetime',
      readOnly: true,
    },
    {
      name: 'deliveredAt',
      title: 'Delivered At',
      type: 'datetime',
    },
    
    // ── Admin Notes ──
    {
      name: 'adminNotes',
      title: 'Admin Notes',
      type: 'text',
      description: 'Internal notes about this order',
    },
    {
      name: 'cancellationReason',
      title: 'Cancellation Reason',
      type: 'text',
      hidden: ({ document }: any) => document?.orderStatus !== 'cancelled',
    },
  ],

  // ── Preview Configuration ──
  preview: {
    select: {
      title: 'customerName',
      reseller: 'resellerEmail',
      total: 'totalAmount',
      status: 'orderStatus',
      paymentMode: 'paymentMode',
      orderedAt: 'orderedAt',
      productCount: 'products.length',
    },
    prepare({ title, reseller, total, status, paymentMode, orderedAt, productCount }: any) {
      const statusColors: Record<string, string> = {
        pending: '🟡',
        processing: '🔵',
        shipped: '🟣',
        delivered: '🟢',
        cancelled: '🔴',
        refunded: '⚪',
      };
      
      return {
        title: `${title} - ₹${total || 0}`,
        subtitle: `${reseller || 'No reseller'} • ${productCount || 0} items • ${paymentMode || 'N/A'}`,
        description: `${statusColors[status] || '⚪'} ${status?.toUpperCase() || 'PENDING'} • ${orderedAt ? new Date(orderedAt).toLocaleDateString() : ''}`,
      };
    },
  },

  // ── Order Actions (Custom ordering) ──
  orderings: [
    {
      title: 'Order Date (Newest)',
      name: 'orderedAtDesc',
      by: [{ field: 'orderedAt', direction: 'desc' }],
    },
    {
      title: 'Order Date (Oldest)',
      name: 'orderedAtAsc',
      by: [{ field: 'orderedAt', direction: 'asc' }],
    },
    {
      title: 'Total Amount (Highest)',
      name: 'totalAmountDesc',
      by: [{ field: 'totalAmount', direction: 'desc' }],
    },
    {
      title: 'Order Status',
      name: 'statusAsc',
      by: [{ field: 'orderStatus', direction: 'asc' }],
    },
  ],
};