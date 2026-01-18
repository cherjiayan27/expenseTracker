import { SubscriptionPage as SubscriptionPageContent } from "@/features/subscription/ui";
import { getSubscriptions } from "@/features/subscription/actions";

export default async function SubscriptionPage() {
  const subscriptions = await getSubscriptions();
  
  return <SubscriptionPageContent initialSubscriptions={subscriptions} />;
}
