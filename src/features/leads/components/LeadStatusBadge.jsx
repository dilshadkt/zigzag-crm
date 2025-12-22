const LeadStatusBadge = ({ status }) => {
  // Handle both object (from backend) and string (fallback) formats
  const statusObj = typeof status === "object" ? status : null;
  const statusName = statusObj?.name || status || "Unknown";
  const statusColor = statusObj?.color || "#94a3b8"; // Default to slate gray

  // Convert hex color to RGB for background opacity
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
      : { r: 148, g: 163, b: 184 }; // Default slate gray
  };

  const rgb = hexToRgb(statusColor);
  const bgColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;

  return (
    <span
      className="inline-flex whitespace-nowrap items-center gap-2 px-3 py-[3px] rounded-full text-[11px] font-medium"
      style={{
        backgroundColor: bgColor,
        color: statusColor,
      }}
    >
      <span
        className="w-2 h-2  rounded-full"
        style={{ backgroundColor: statusColor }}
      />
      {statusName}
    </span>
  );
};

export default LeadStatusBadge;
