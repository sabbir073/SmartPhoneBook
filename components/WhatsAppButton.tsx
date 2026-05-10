"use client";

function WhatsAppIcon({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.04 21.785c-1.752 0-3.477-.471-4.985-1.36l-.358-.213-3.713.974.99-3.62-.232-.371C2.605 15.62 2.083 13.84 2.083 12.044c0-5.52 4.495-10.014 10.018-10.014 2.677 0 5.19 1.043 7.083 2.937 1.892 1.894 2.933 4.41 2.933 7.087-.003 5.523-4.498 10.018-10.018 10.018zm8.516-18.534C18.27 1.057 15.252 0 12.04 0 5.495 0 .166 5.328.163 11.873c0 2.092.547 4.135 1.588 5.93L.058 24l6.337-1.662a11.882 11.882 0 0 0 5.643 1.437h.005c6.544 0 11.872-5.328 11.875-11.872 0-3.176-1.236-6.158-3.482-8.408z" />
    </svg>
  );
}

function cleanForWa(num: string): string {
  // wa.me wants digits only, no leading + or spaces
  return num.replace(/[^\d]/g, "");
}

export function WhatsAppButton({ mobile }: { mobile: string }) {
  const open = () => {
    const num = cleanForWa(mobile);
    if (!num) return;
    // Universal link — opens app on mobile, web on desktop
    window.open(`https://wa.me/${num}`, "_blank", "noopener");
  };

  return (
    <button
      onClick={open}
      className="tap flex items-center justify-center gap-2 rounded-full font-semibold text-white"
      style={{
        background: "#25D366",
        boxShadow: "0 6px 18px rgba(37,211,102,0.35)",
        height: 56,
        paddingLeft: 24,
        paddingRight: 28,
      }}
      aria-label={`Open WhatsApp chat with ${mobile}`}
    >
      <WhatsAppIcon size={22} />
      <span className="text-base">WhatsApp</span>
    </button>
  );
}
