export function dispatch(source, event, data, targets) {
  return document.dispatchEvent(
    new CustomEvent("trigger", {
      detail: { source, event, data, targets: targets || source },
    })
  );
}
