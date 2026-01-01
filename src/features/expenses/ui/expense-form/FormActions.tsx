interface FormActionsProps {
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function FormActions({ onClose, onConfirm, isPending }: FormActionsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white px-4" style={{ paddingTop: "0.75rem", paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          disabled={isPending}
          className="flex-1 h-14 rounded-[2rem] bg-gray-100 text-black font-bold text-base hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Close
        </button>
        <button
          onClick={onConfirm}
          disabled={isPending}
          className="flex-1 h-14 rounded-[2rem] bg-black text-white font-bold text-base hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Adding..." : "Confirm"}
        </button>
      </div>
    </div>
  );
}
