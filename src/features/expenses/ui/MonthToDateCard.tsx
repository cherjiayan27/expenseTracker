import { Card } from "@/components/ui/card";
import { formatCurrency } from "../domain/expense.calculations";

type MonthToDateCardProps = {
  total: number;
};

export function MonthToDateCard({ total }: MonthToDateCardProps) {
  return (
    <Card className="p-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-600">Spent this month</p>
        <p className="text-3xl font-bold text-gray-900">
          {formatCurrency(total)}
        </p>
      </div>
    </Card>
  );
}

