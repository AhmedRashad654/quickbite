
const PaymentRedirect = () => {

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
      <div className="flex flex-col items-center max-w-sm p-8 mx-4 text-center bg-white shadow-2xl rounded-2xl animate-fade-in">
        <div className="relative flex items-center justify-center w-20 h-20 mb-6">
          <div className="absolute w-full h-full border-4 border-solid rounded-full border-emerald-100"></div>
          <div className="absolute w-full h-full border-4 border-solid rounded-full animate-spin border-emerald-500 border-t-transparent"></div>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-emerald-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>

        <h3 className="mb-2 text-xl font-bold text-slate-800">
          Securing Your Payment
        </h3>

        <p className="text-sm leading-relaxed text-slate-500">
          Please wait a moment while we redirect you to the secure payment
          gateway. Do not close or refresh this page.
        </p>

        <div className="flex space-x-1.5 mt-5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default PaymentRedirect;
