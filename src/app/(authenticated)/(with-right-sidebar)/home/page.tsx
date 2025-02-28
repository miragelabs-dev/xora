import { HomeView } from "@/components/home-view";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Home',
  description: 'Your personalized feed of posts and updates',
};

export default function HomePage() {
  return <HomeView />;
}
