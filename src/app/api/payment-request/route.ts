import { NextRequest, NextResponse } from "next/server";
import { isValidEmail } from "@/lib/payfast";
import { sendReceiptEmail } from "@/app/api/mail/route";
// Prefer: import { sendReceiptEmail } from "@/lib/mail";

// Next.js port of POST /api/payment/notify from Api/payment-request.js.
// PayFast sends application/x-www-form-urlencoded.

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let body: Record<string, string> = {};

    if (contentType.includes("application/json")) {
      body = (await req.json()) as Record<string, string>;
    } else {
      // PayFast ITN is typically form-urlencoded
      const form = await req.formData();
      form.forEach((value, key) => {
        body[key] = String(value);
      });
    }

    console.log(
      "Received payment notification headers:",
      Object.fromEntries(req.headers),
    );
    console.log("Received payment notification body:", body);

    const {
      pf_payment_id,
      payment_status,
      amount_gross,
      amount_fee,
      amount_net,
      m_payment_id,
      item_name,
      custom_str1,
      email_address,
    } = body;

    console.log("Extracted values:", {
      pf_payment_id,
      payment_status,
      amount_gross,
      amount_fee,
      amount_net,
      m_payment_id,
      item_name,
      custom_str1,
      email_address,
    });

    if (!payment_status) {
      console.log("Payment status is undefined. Notification body:", body);
      return new NextResponse("Invalid notification body", { status: 400 });
    }

    if (payment_status === "COMPLETE") {
      console.log("Validating email:", email_address);
      const emailValid = email_address ? isValidEmail(email_address) : false;
      console.log(`Is email valid? ${emailValid}`);

      if (emailValid && email_address) {
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
    .container { max-width: 600px; margin: auto; padding: 20px; background: #ffffff; border: 1px solid #ddd; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 1px solid #ddd; margin-bottom: 20px; }
    .header img { max-width: 150px; height: auto; }
    .content { margin-bottom: 20px; }
    .footer { text-align: center; font-size: 12px; color: #777; border-top: 1px solid #ddd; padding-top: 10px; }
    .invoice-details { margin: 20px 0; padding: 15px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 5px; }
    ul { list-style: none; padding: 0; }
    ul li { margin-bottom: 10px; }
    strong { color: #000; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Payment Receipt</h1>
      <img src="https://github.com/Gotcha1001/My-Images-for-sites-Wes/blob/main/CodeNowLogoCorrect.png?raw=true" alt="CodeNow Logo">
    </div>
    <div class="content">
      <p>Dear ${email_address || "Customer"},</p>
      <p>Thank you for your payment! Below are the details of your transaction:</p>
      <div class="invoice-details">
        <ul>
          <li><strong>Transaction ID:</strong> ${pf_payment_id ?? ""}</li>
          <li><strong>Item Purchased:</strong> ${item_name ?? ""}</li>
          <li><strong>Amount Paid:</strong> ${amount_gross ?? ""}</li>
          <li><strong>Payment Status:</strong> ${payment_status}</li>
          <li><strong>Transaction Fee:</strong> ${amount_fee ?? ""}</li>
          <li><strong>Net Amount Received:</strong> ${amount_net ?? ""}</li>
        </ul>
      </div>
      <p>If you have any questions, feel free to contact us at <a href="mailto:CodeNow101@gmail.com">CodeNow101@gmail.com</a></p>
    </div>
    <div class="footer">
      <p>&copy; 2024 CodeNow101. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`.trim();

        await sendReceiptEmail(email_address, "Payment Receipt", emailHtml);
        console.log("Receipt email sent to:", email_address);
      } else {
        console.error("Invalid email address:", email_address);
        return new NextResponse("Invalid email address", { status: 400 });
      }
    } else if (payment_status === "CANCELLED") {
      console.log("Payment was cancelled.");
    } else {
      console.log("Unhandled payment status:", payment_status);
    }

    // PayFast expects 200 OK
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Error handling payment notification:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
