export default function AppIcon({ name, size = 30 }) {
  const s = Number(size) || 30;
  const props = {
    width: s,
    height: s,
    viewBox: "0 0 24 24",
    className: "app-icon-svg",
    "aria-hidden": "true",
    style: { flexShrink: 0, display: "block" },
  };

  switch (name) {
    case "TikTok":
      return (
        <svg {...props}>
          <rect width="24" height="24" rx="6" fill="#111111" />
          <path
            d="M15.8 6.3a3.6 3.6 0 0 0 2.5 2v2.2a5.7 5.7 0 0 1-2.5-.8v4.6a4.4 4.4 0 1 1-4.4-4.4c.3 0 .6 0 .9.1v2.3a2.2 2.2 0 1 0 1.4 2.1V5.2h2.1v1.1Z"
            fill="#25F4EE"
            transform="translate(-0.5,-0.3)"
          />
          <path
            d="M15.8 6.3a3.6 3.6 0 0 0 2.5 2v2.2a5.7 5.7 0 0 1-2.5-.8v4.6a4.4 4.4 0 1 1-4.4-4.4c.3 0 .6 0 .9.1v2.3a2.2 2.2 0 1 0 1.4 2.1V5.2h2.1v1.1Z"
            fill="#FE2C55"
            transform="translate(0.5,0.3)"
          />
          <path
            d="M15.8 6.3a3.6 3.6 0 0 0 2.5 2v2.2a5.7 5.7 0 0 1-2.5-.8v4.6a4.4 4.4 0 1 1-4.4-4.4c.3 0 .6 0 .9.1v2.3a2.2 2.2 0 1 0 1.4 2.1V5.2h2.1v1.1Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "Instagram":
      return (
        <svg {...props}>
          <defs>
            <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FCAF45" />
              <stop offset="45%" stopColor="#E1306C" />
              <stop offset="100%" stopColor="#833AB4" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="6" fill="url(#ig-grad)" />
          <rect
            x="5.5"
            y="5.5"
            width="13"
            height="13"
            rx="3.8"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.8"
          />
          <circle cx="12" cy="12" r="3.1" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
          <circle cx="15.8" cy="8.2" r="1" fill="#FFFFFF" />
        </svg>
      );

    case "YouTube":
      return (
        <svg {...props}>
          <rect width="24" height="24" rx="6" fill="#FF0000" />
          <path
            d="M18.6 9.1a2 2 0 0 0-1.4-1.4C16 7.4 12 7.4 12 7.4s-4 0-5.2.3a2 2 0 0 0-1.4 1.4C5.1 10.3 5.1 12 5.1 12s0 1.7.3 2.9a2 2 0 0 0 1.4 1.4c1.2.3 5.2.3 5.2.3s4 0 5.2-.3a2 2 0 0 0 1.4-1.4c.3-1.2.3-2.9.3-2.9s0-1.7-.3-2.9Z"
            fill="#FFFFFF"
          />
          <polygon points="10.6,10 14.5,12 10.6,14" fill="#FF0000" />
        </svg>
      );

    case "Snapchat":
      return (
        <svg {...props}>
          <rect width="24" height="24" rx="6" fill="#FFFC00" />
          <path
            d="M12 5.4c-2 0-3.4 1.4-3.4 3.5v1.3c-.4-.1-.9-.1-1.2.2-.3.3-.2.8.3 1 .5.2.8.4.8.7 0 .5-.7 1.3-1.9 1.7-.3.1-.5.4-.4.7.1.3.4.5.9.6.6.1 1.1.4 1.4.8.2.3.5.4.9.3.6-.1 1.2.1 1.6.4.3.2.7.3 1 .3s.7-.1 1-.3c.4-.3 1-.5 1.6-.4.4.1.7 0 .9-.3.3-.4.8-.7 1.4-.8.5-.1.8-.3.9-.6.1-.3-.1-.6-.4-.7-1.2-.4-1.9-1.2-1.9-1.7 0-.3.3-.5.8-.7.5-.2.6-.7.3-1-.3-.3-.8-.3-1.2-.2V8.9c0-2.1-1.4-3.5-3.4-3.5Z"
            fill="#FFFFFF"
            stroke="#111111"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "WhatsApp":
      return (
        <svg {...props}>
          <rect width="24" height="24" rx="6" fill="#25D366" />
          <path
            d="M12 5.5a6.4 6.4 0 0 0-5.5 9.7l-.8 3 3.1-.8A6.4 6.4 0 1 0 12 5.5Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M9.8 9.2c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.8 2.1.8 2.5.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3s-1.5-.7-1.7-.8c-.2-.1-.4-.1-.6.1-.2.3-.6.8-.8 1-.1.2-.3.2-.6.1-.3-.1-1.2-.4-2.2-1.4-.8-.7-1.4-1.6-1.5-1.9-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.7-1.7Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "Facebook":
      return (
        <svg {...props}>
          <rect width="24" height="24" rx="6" fill="#1877F2" />
          <path
            d="M15.3 12.8l.4-2.6h-2.5V8.5c0-.7.4-1.4 1.5-1.4h1.1V4.9s-1-.2-2-.2c-2 0-3.3 1.2-3.3 3.4v2.1H8.2v2.6h2.3V19h2.7v-6.2h2.1Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "Twitter":
      return (
        <svg {...props}>
          <rect width="24" height="24" rx="6" fill="#14171A" />
          <path
            d="M16.9 6.2h2.2l-4.8 5.5 5.6 7.4h-4.4l-3.4-4.5-4 4.5H5.9l5.1-5.8L5.6 6.2h4.5l3.1 4.1 3.7-4.1Zm-.8 11.6h1.2L9.3 7.4H8l8.1 10.4Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    case "LinkedIn":
      return (
        <svg {...props}>
          <rect width="24" height="24" rx="6" fill="#0A66C2" />
          <rect x="6.2" y="9.8" width="2.4" height="7.9" rx="0.4" fill="#FFFFFF" />
          <circle cx="7.4" cy="7.2" r="1.4" fill="#FFFFFF" />
          <path
            d="M10.8 9.8h2.3v1.1c.4-.7 1.3-1.3 2.5-1.3 2 0 3.2 1.3 3.2 3.6v4.5h-2.4v-4c0-1.1-.4-1.8-1.4-1.8s-1.8.7-1.8 1.9v3.9h-2.4V9.8Z"
            fill="#FFFFFF"
          />
        </svg>
      );

    default:
      return (
        <svg {...props}>
          <rect width="24" height="24" rx="6" fill="#F96B1C" />
          <rect x="7" y="4.5" width="10" height="15" rx="2" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
          <circle cx="12" cy="16.5" r="0.9" fill="#FFFFFF" />
        </svg>
      );
  }
}
