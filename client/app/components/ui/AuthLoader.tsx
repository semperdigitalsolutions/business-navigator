export default function AuthLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-auto w-full max-w-sm rounded-md border border-gray-200 p-4 shadow-md">
        <div className="flex animate-pulse space-x-4">
          <div className="size-10 rounded-full bg-gray-300"></div>
          <div className="flex-1 space-y-6 py-1">
            <div className="h-2 rounded bg-gray-300"></div>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 h-2 rounded bg-gray-300"></div>
                <div className="col-span-1 h-2 rounded bg-gray-300"></div>
              </div>
              <div className="h-2 rounded bg-gray-300"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
