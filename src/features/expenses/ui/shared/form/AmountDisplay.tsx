interface AmountDisplayProps {
  amount: string;
}

export function AmountDisplay({ amount }: AmountDisplayProps) {
  return (
    <div className="flex items-start justify-center mb-6">
      <span className="text-2xl font-medium mt-1 mr-1 text-black">$</span>
      <span className="text-6xl font-medium text-black tracking-tight">{amount}</span>
    </div>
  );
}
