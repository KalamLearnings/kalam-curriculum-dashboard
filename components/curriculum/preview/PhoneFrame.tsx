/**
 * PhoneFrame Component
 *
 * Simulates an iPhone/mobile device frame for activity previews
 */

'use client';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div
      className="mx-auto bg-gray-900 rounded-[2.5rem] p-2.5 shadow-2xl"
      style={{ width: 320, minHeight: 600 }}
    >
      {/* Status bar */}
      <div className="h-9 flex items-center justify-between px-5 text-white text-xs">
        <span>9:41</span>
        <div className="flex items-center gap-1">
          <span>📶</span>
          <span>📡</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Screen */}
      <div
        className="bg-white rounded-[2.25rem] overflow-y-auto"
        style={{ height: 560 }}
      >
        {children}
      </div>

      {/* Home indicator (iOS style) */}
      <div className="h-5 flex items-center justify-center">
        <div className="w-28 h-1 bg-gray-600 rounded-full" />
      </div>
    </div>
  );
}
