import { Mongo } from "meteor/mongo";

interface patient {
  _id: string;
  qr_code?: string;
  status: "ben" | "neutral" | "alison";
  patient_id: string;
}

export const PatientCollection = new Mongo.Collection<patient>("patient");

