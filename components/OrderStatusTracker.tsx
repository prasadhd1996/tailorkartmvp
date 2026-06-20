import { ORDER_STATUSES, STATUS_LABELS, OrderStatus } from "@/lib/utils";

interface OrderStatusTrackerProps {
  currentStatus: OrderStatus;
}

export default function OrderStatusTracker({ currentStatus }: OrderStatusTrackerProps) {
  const currentIndex = ORDER_STATUSES.indexOf(currentStatus);

  return (
    <div className="w-full py-4">
      <div className="flex items-start justify-between">
        {ORDER_STATUSES.map((status, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={status} className="flex flex-col items-center flex-1">
              {/* Connector line left */}
              <div className="flex items-center w-full">
                {index > 0 && (
                  <div
                    className={`flex-1 h-1 ${
                      isCompleted || isCurrent ? "bg-rose-500" : "bg-stone-200"
                    }`}
                  />
                )}

                {/* Circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
                    isCompleted
                      ? "bg-rose-500 border-rose-500 text-white"
                      : isCurrent
                      ? "bg-white border-rose-500 text-rose-600"
                      : "bg-white border-stone-300 text-stone-400"
                  }`}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>

                {/* Connector line right */}
                {index < ORDER_STATUSES.length - 1 && (
                  <div
                    className={`flex-1 h-1 ${
                      isCompleted ? "bg-rose-500" : "bg-stone-200"
                    }`}
                  />
                )}
              </div>

              {/* Label */}
              <div className="mt-2 text-center px-1">
                <p
                  className={`text-xs font-medium ${
                    isCurrent
                      ? "text-rose-600"
                      : isCompleted
                      ? "text-rose-400"
                      : "text-stone-400"
                  }`}
                >
                  {STATUS_LABELS[status]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
