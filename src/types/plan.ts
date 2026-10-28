export interface PlanPrice {
  months: number;
  priceCup: number;
}

/** A sellable plan from GET /api/v1/plans. Prices are in CUP and editable by the admin. */
export interface Plan {
  id: string;
  code: string;
  audience: "employee" | "employer";
  name: string;
  jobLimit: number | null;
  candidateSearch: boolean;
  prices: PlanPrice[];
}

/** Where to send the Transfermóvil transfer (GET /api/v1/plans/payment-destination). */
export interface PaymentDestination {
  card: string;
  phone: string;
  holder: string;
  instructionsEs: string;
  instructionsEn: string;
}

export type PaymentStatus = "pending" | "approved" | "rejected";

export interface MyPayment {
  id: string;
  planCode: string;
  planName: string;
  months: number;
  amountCup: number;
  transferNumber: string;
  status: PaymentStatus;
  rejectReason: string | null;
  hasScreenshot: boolean;
  createdAt: string;
}
