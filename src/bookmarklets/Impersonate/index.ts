const trackingCode = prompt("Tracking Code");
if (trackingCode)
  location.href = `https://app.reclaim.ai/?shadowTrackingCode=${trackingCode}`;
