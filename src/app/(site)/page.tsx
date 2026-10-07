import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";
import { homeMetadata } from "@/lib/home-meta";

export async function generateMetadata(): Promise<Metadata> {
  return homeMetadata("en");
}

export default function Home() {
  return <HomePage locale="en" />;
}
