import { getFirestore } from "@/lib/firebase/getFirestore";
import { useState } from "react";

export const useFirestore = () => {
  const [firestore] = useState(getFirestore());
  return firestore;
};
