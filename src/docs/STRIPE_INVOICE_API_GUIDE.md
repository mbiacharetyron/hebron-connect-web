# Stripe Invoice API Guide

## Overview

This API allows room owners and admins to fetch and download subscription invoices from Stripe. Users can view invoice history, download PDF receipts, and access detailed billing information.

---

## Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Authentication](#authentication)
3. [Usage Examples](#usage-examples)
4. [Invoice Object](#invoice-object)
5. [Download Options](#download-options)
6. [Error Handling](#error-handling)
7. [Implementation Guide](#implementation-guide)

---

## API Endpoints

### 1. Get All Invoices for a Room

**Endpoint:** `GET /api/v1/connect-rooms/{room_id}/subscription/invoices`

**Description:** Fetch all invoices for a room's subscription

**Authorization:** Required (Bearer Token)

**Permissions:** Room owner or admin

**Response:**
```json
{
  "success": true,
  "message": "Invoices retrieved successfully",
  "data": {
    "invoices": [
      {
        "id": "in_1SMFjWGNQGZu00geMYy59zBU",
        "number": "A1B2C3D4-0001",
        "status": "paid",
        "amount_due": 1.99,
        "amount_paid": 1.99,
        "total": 1.99,
        "currency": "USD",
        "created": "2025-10-25 22:14:47",
        "due_date": null,
        "period_start": "2025-10-25 21:56:32",
        "period_end": "2025-11-25 21:56:32",
        "invoice_pdf": "https://pay.stripe.com/invoice/invst_xxx/pdf",
        "hosted_invoice_url": "https://invoice.stripe.com/i/invst_xxx",
        "customer_email": "user@example.com",
        "customer_name": "John Doe",
        "description": "Subscription creation",
        "subscription_id": "sub_1SMFRqGNQGZu00geG1XG5C3U",
        "paid": true,
        "attempted": true
      }
    ],
    "room": {
      "id": 75,
      "name": "Hebron Global LLC"
    },
    "subscription": {
      "plan": "Pro Plan",
      "status": "active"
    }
  }
}
```

---

### 2. Get Single Invoice

**Endpoint:** `GET /api/v1/connect-rooms/{room_id}/subscription/invoices/{invoice_id}`

**Description:** Fetch details for a specific invoice

**Authorization:** Required (Bearer Token)

**Permissions:** Room owner or admin

**Response:**
```json
{
  "success": true,
  "message": "Invoice retrieved successfully",
  "data": {
    "invoice": {
      "id": "in_1SMFjWGNQGZu00geMYy59zBU",
      "number": "A1B2C3D4-0001",
      "status": "paid",
      "amount_due": 1.99,
      "amount_paid": 1.99,
      "total": 1.99,
      "currency": "USD",
      "created": "2025-10-25 22:14:47",
      "due_date": null,
      "period_start": "2025-10-25 21:56:32",
      "period_end": "2025-11-25 21:56:32",
      "invoice_pdf": "https://pay.stripe.com/invoice/invst_xxx/pdf",
      "hosted_invoice_url": "https://invoice.stripe.com/i/invst_xxx",
      "customer_email": "user@example.com",
      "customer_name": "John Doe",
      "description": "Subscription creation",
      "subscription_id": "sub_1SMFRqGNQGZu00geG1XG5C3U",
      "paid": true,
      "attempted": true
    }
  }
}
```

---

## Authentication

All endpoints require authentication via Bearer token:

```http
Authorization: Bearer {your_access_token}
```

---

## Usage Examples

### Example 1: Fetch All Invoices

```bash
curl -X GET \
  'https://api.hebronconnect.com/api/v1/connect-rooms/75/subscription/invoices' \
  -H 'Authorization: Bearer {token}'
```

**Flutter/Dart:**
```dart
final response = await http.get(
  Uri.parse('$baseUrl/connect-rooms/$roomId/subscription/invoices'),
  headers: {
    'Authorization': 'Bearer $token',
    'Accept': 'application/json',
  },
);

if (response.statusCode == 200) {
  final data = jsonDecode(response.body);
  final invoices = data['data']['invoices'] as List;
  // Display invoices in your app
}
```

---

### Example 2: Fetch Single Invoice

```bash
curl -X GET \
  'https://api.hebronconnect.com/api/v1/connect-rooms/75/subscription/invoices/in_1SMFjWGNQGZu00geMYy59zBU' \
  -H 'Authorization: Bearer {token}'
```

**Flutter/Dart:**
```dart
final response = await http.get(
  Uri.parse('$baseUrl/connect-rooms/$roomId/subscription/invoices/$invoiceId'),
  headers: {
    'Authorization': 'Bearer $token',
    'Accept': 'application/json',
  },
);

if (response.statusCode == 200) {
  final data = jsonDecode(response.body);
  final invoice = data['data']['invoice'];
  // Display invoice details
}
```

---

## Invoice Object

### Fields Explained

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Stripe invoice ID (e.g., `in_xxx`) |
| `number` | string | Human-readable invoice number |
| `status` | string | `draft`, `open`, `paid`, `uncollectible`, `void` |
| `amount_due` | number | Amount due (in currency units) |
| `amount_paid` | number | Amount paid (in currency units) |
| `total` | number | Total amount (in currency units) |
| `currency` | string | Three-letter currency code (USD, XAF, etc.) |
| `created` | string | Invoice creation date (Y-m-d H:i:s) |
| `due_date` | string\|null | Payment due date |
| `period_start` | string | Billing period start date |
| `period_end` | string | Billing period end date |
| `invoice_pdf` | string | URL to download PDF |
| `hosted_invoice_url` | string | URL to view invoice in browser |
| `customer_email` | string | Customer email address |
| `customer_name` | string | Customer name |
| `description` | string | Invoice description |
| `subscription_id` | string | Associated subscription ID |
| `paid` | boolean | Whether invoice is paid |
| `attempted` | boolean | Whether payment was attempted |

### Status Values

- **`draft`**: Invoice not yet finalized
- **`open`**: Invoice finalized and awaiting payment
- **`paid`**: Invoice successfully paid ✅
- **`uncollectible`**: Marked as uncollectible
- **`void`**: Invoice voided

---

## Download Options

### Option 1: Direct PDF Download

Use the `invoice_pdf` URL to download the PDF directly:

```dart
import 'package:url_launcher/url_launcher.dart';

void downloadInvoicePDF(String pdfUrl) async {
  if (await canLaunchUrl(Uri.parse(pdfUrl))) {
    await launchUrl(Uri.parse(pdfUrl));
  }
}
```

### Option 2: View in Browser

Use the `hosted_invoice_url` to open in browser:

```dart
void viewInvoiceInBrowser(String hostedUrl) async {
  if (await canLaunchUrl(Uri.parse(hostedUrl))) {
    await launchUrl(
      Uri.parse(hostedUrl),
      mode: LaunchMode.externalApplication,
    );
  }
}
```

### Option 3: Download and Save Locally

```dart
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'dart:io';

Future<String> downloadAndSaveInvoice(String pdfUrl, String invoiceNumber) async {
  try {
    final response = await http.get(Uri.parse(pdfUrl));
    
    if (response.statusCode == 200) {
      final directory = await getApplicationDocumentsDirectory();
      final filePath = '${directory.path}/invoice_$invoiceNumber.pdf';
      final file = File(filePath);
      await file.writeAsBytes(response.bodyBytes);
      return filePath;
    }
    throw Exception('Failed to download PDF');
  } catch (e) {
    print('Error downloading invoice: $e');
    rethrow;
  }
}
```

---

## Error Handling

### Common Errors

| Status Code | Error | Solution |
|-------------|-------|----------|
| 401 | Unauthorized | Check authentication token |
| 403 | Forbidden | User must be room owner or admin |
| 404 | Not Found | Room or subscription doesn't exist |
| 400 | Bad Request | Non-Stripe subscription |
| 500 | Server Error | Stripe API error - check logs |

### Error Response Format

```json
{
  "success": false,
  "message": "Only room owners or admins can view invoices"
}
```

### Handle Errors in Flutter

```dart
try {
  final response = await http.get(url, headers: headers);
  
  if (response.statusCode == 200) {
    // Success
    final data = jsonDecode(response.body);
    return data['data']['invoices'];
  } else if (response.statusCode == 403) {
    // Permission denied
    showError('You don\'t have permission to view invoices');
  } else if (response.statusCode == 404) {
    // Not found
    showError('No active subscription found');
  } else {
    // Other errors
    final error = jsonDecode(response.body);
    showError(error['message'] ?? 'Failed to load invoices');
  }
} catch (e) {
  showError('Network error: $e');
}
```

---

## Implementation Guide

### Flutter UI Example

```dart
class InvoiceListScreen extends StatefulWidget {
  final int roomId;
  
  @override
  _InvoiceListScreenState createState() => _InvoiceListScreenState();
}

class _InvoiceListScreenState extends State<InvoiceListScreen> {
  List<dynamic> invoices = [];
  bool loading = true;
  
  @override
  void initState() {
    super.initState();
    fetchInvoices();
  }
  
  Future<void> fetchInvoices() async {
    setState(() => loading = true);
    
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/connect-rooms/${widget.roomId}/subscription/invoices'),
        headers: {
          'Authorization': 'Bearer $token',
          'Accept': 'application/json',
        },
      );
      
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          invoices = data['data']['invoices'];
          loading = false;
        });
      } else {
        throw Exception('Failed to load invoices');
      }
    } catch (e) {
      setState(() => loading = false);
      showError(context, 'Error loading invoices: $e');
    }
  }
  
  @override
  Widget build(BuildContext context) {
    if (loading) {
      return Center(child: CircularProgressIndicator());
    }
    
    if (invoices.isEmpty) {
      return Center(child: Text('No invoices yet'));
    }
    
    return ListView.builder(
      itemCount: invoices.length,
      itemBuilder: (context, index) {
        final invoice = invoices[index];
        return InvoiceCard(invoice: invoice);
      },
    );
  }
}

class InvoiceCard extends StatelessWidget {
  final Map<String, dynamic> invoice;
  
  @override
  Widget build(BuildContext context) {
    final isPaid = invoice['paid'] as bool;
    final amount = invoice['total'];
    final currency = invoice['currency'];
    final date = invoice['created'];
    final number = invoice['number'];
    
    return Card(
      margin: EdgeInsets.all(8),
      child: ListTile(
        leading: Icon(
          isPaid ? Icons.check_circle : Icons.pending,
          color: isPaid ? Colors.green : Colors.orange,
        ),
        title: Text('Invoice #$number'),
        subtitle: Text('$date\n$currency $amount'),
        isThreeLine: true,
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            IconButton(
              icon: Icon(Icons.visibility),
              onPressed: () => viewInvoice(invoice['hosted_invoice_url']),
            ),
            IconButton(
              icon: Icon(Icons.download),
              onPressed: () => downloadInvoice(invoice['invoice_pdf']),
            ),
          ],
        ),
      ),
    );
  }
  
  void viewInvoice(String url) async {
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url));
    }
  }
  
  void downloadInvoice(String url) async {
    if (await canLaunchUrl(Uri.parse(url))) {
      await launchUrl(Uri.parse(url));
    }
  }
}
```

---

## Features

### 1. Invoice History

- ✅ View all past invoices
- ✅ Sorted by date (newest first)
- ✅ Limit to last 20 invoices
- ✅ Paginated results

### 2. Invoice Details

- ✅ Invoice number
- ✅ Payment status
- ✅ Amount and currency
- ✅ Billing period
- ✅ Customer information

### 3. Download Options

- ✅ PDF download link
- ✅ Hosted invoice URL (view in browser)
- ✅ Direct download to device
- ✅ Share invoice

### 4. Security

- ✅ Authentication required
- ✅ Permission checks (owner/admin only)
- ✅ Room validation
- ✅ Subscription validation

---

## Testing

### Test Scenario 1: View All Invoices

```bash
# 1. Create a subscription
POST /api/v1/connect-rooms/75/subscribe

# 2. Wait for payment to complete

# 3. Fetch invoices
GET /api/v1/connect-rooms/75/subscription/invoices
```

### Test Scenario 2: Download Invoice

```bash
# 1. Get invoices list
GET /api/v1/connect-rooms/75/subscription/invoices

# 2. Copy invoice_pdf URL from response

# 3. Open in browser or download:
curl -O {invoice_pdf_url}
```

### Test Scenario 3: View Specific Invoice

```bash
# Get single invoice
GET /api/v1/connect-rooms/75/subscription/invoices/in_xxx
```

---

## Best Practices

1. **Cache Invoices**: Store invoices locally to reduce API calls
2. **Show Status**: Display payment status with colors/icons
3. **Enable Download**: Allow users to download PDFs for records
4. **Error Handling**: Gracefully handle network errors
5. **Permission Check**: Verify user has access before showing invoices
6. **Loading States**: Show loading indicators while fetching

---

## Stripe Dashboard

View all invoices in Stripe Dashboard:
1. Go to **Payments → Invoices**
2. Search by customer or subscription
3. View details and download PDFs

---

## Related Documentation

- [Stripe Recurring Subscription API](./STRIPE_RECURRING_SUBSCRIPTION_API.md)
- [Subscription Management Guide](./SUBSCRIPTION_MANAGEMENT_GUIDE.md)
- [Stripe Webhook Handling](./STRIPE_WEBHOOK_TIMESTAMP_FIX.md)

---

**Version:** 1.0  
**Last Updated:** October 25, 2025  
**Status:** ✅ Production Ready

