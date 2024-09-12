export function extractDataFromVlessLink(vlessLink) {
  try {
    const [authAndServer, queryString] = vlessLink
      .split("vless://")[1]
      .split("?");
    const serverAddress = authAndServer.split("@")[1].split(":")[0];

    const urlSearchParams = new URLSearchParams(queryString);
    const hostname = urlSearchParams.get("host") || urlSearchParams.get("sni");

    const geoLocation = vlessLink.split("#")[1];

    return {
      serverAddress,
      hostname,
      geoLocation,
    };
  } catch (error) {
    console.error("Error extracting VLESS link:", error);
    return {};
  }
}
