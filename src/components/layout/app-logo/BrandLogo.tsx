// Experttrader Brand Logo
// Custom SVG logo for the Experttrader trading bot platform

type TBrandLogoProps = {
    width?: number;
    height?: number;
    fill?: string;
    className?: string;
};

export const BrandLogo = ({
    width = 160,
    height = 36,
    fill = 'currentColor',
    className = ''
}: TBrandLogoProps) => {
    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 160 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-label="Experttrader Logo"
        >
            {/* Chart/pulse icon */}
            <g transform="translate(2, 4)">
                {/* Rounded square background */}
                <rect x="0" y="0" width="28" height="28" rx="6" fill="#00848c" />
                {/* Upward trending line */}
                <polyline
                    points="5,20 10,14 15,17 23,7"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
                {/* Arrow tip */}
                <polyline
                    points="19,7 23,7 23,11"
                    stroke="#fec20f"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                />
            </g>

            {/* "Expert" text */}
            <text
                x="35"
                y="23"
                fontFamily="'Inter', system-ui, -apple-system, sans-serif"
                fontSize="16"
                fontWeight="700"
                fill={fill}
                letterSpacing="-0.3"
            >
                Expert
            </text>

            {/* "trader" text in teal */}
            <text
                x="89"
                y="23"
                fontFamily="'Inter', system-ui, -apple-system, sans-serif"
                fontSize="16"
                fontWeight="700"
                fill="#00848c"
                letterSpacing="-0.3"
            >
                trader
            </text>
        </svg>
    );
};
