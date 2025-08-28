import React from 'react';

const CameraView = React.forwardRef<HTMLVideoElement, { isActive: boolean }>(
  ({ isActive }, ref) => (
    <div className="relative flex size-full items-center justify-center overflow-hidden rounded-2xl border-4 border-white/50 bg-gradient-to-br from-blue-100 to-blue-200 shadow-inner">
      {' '}
      {!isActive && (
        <div className="p-4 text-center">
          {' '}
          <div className="mx-auto mb-4 flex size-12 animate-bounce items-center justify-center rounded-full bg-blue-300 sm:size-16">
            {' '}
            <svg
              className="size-6 text-blue-600 sm:size-8"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {' '}
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />{' '}
            </svg>{' '}
          </div>{' '}
          <p className="font-comic font-bold text-purple-800 drop-shadow-sm">
            Kamera tidak aktif
          </p>{' '}
        </div>
      )}{' '}
      <video
        ref={ref}
        autoPlay
        playsInline
        muted
        className={`size-full -scale-x-100 object-cover ${isActive ? 'block' : 'hidden'}`}
      />{' '}
      <div className="pointer-events-none absolute inset-2 rounded-xl border-2 border-white/30">
        {' '}
        <div className="absolute left-2 top-2 size-4 border-l-2 border-t-2 border-white/60"></div>{' '}
        <div className="absolute right-2 top-2 size-4 border-r-2 border-t-2 border-white/60"></div>{' '}
        <div className="absolute bottom-2 left-2 size-4 border-b-2 border-l-2 border-white/60"></div>{' '}
        <div className="absolute bottom-2 right-2 size-4 border-b-2 border-r-2 border-white/60"></div>{' '}
      </div>{' '}
    </div>
  )
);

CameraView.displayName = 'CameraView';

export default CameraView;
