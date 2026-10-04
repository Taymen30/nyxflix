// Shared Tailwind utilities keep the loading placeholders aligned with the page.
export const mediaStyles = {
  page: "media-page group relative isolate min-h-full bg-[#08090c]",
  layout:
    "media-layout grid min-h-dvh grid-rows-[minmax(160px,1fr)_auto] gap-7 px-[clamp(24px,4vw,72px)] pb-11 pt-[88px] max-sm:grid-rows-[minmax(180px,1fr)_auto] max-sm:gap-6 max-sm:px-6 max-sm:pb-7 max-sm:pt-[72px] max-sm:group-has-[.media-player-frame]:grid-rows-[auto_auto] max-sm:group-has-[.media-player-frame]:content-center",
  stage:
    "media-player-stage flex min-h-0 min-w-0 items-center justify-center max-sm:group-has-[.media-player-frame]:aspect-video",
  titleRow: "flex flex-wrap items-baseline gap-x-5 gap-y-2 max-sm:gap-x-3",
  genres:
    "mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-white/75 max-sm:mt-3 max-sm:text-xs",
  overview:
    "media-overview mt-5 max-w-[660px] text-[15px] leading-[1.7] text-white/80 max-sm:mt-4 max-sm:text-[13px] group-has-[.media-player-frame]:mt-3 group-has-[.media-player-frame]:max-h-[3.4em] group-has-[.media-player-frame]:overflow-y-auto",
  actions:
    "media-actions mt-6 flex flex-wrap items-center gap-5 max-sm:mt-5 max-sm:gap-3 group-has-[.media-player-frame]:mt-4",
};
