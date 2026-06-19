export function percentFromPointer(
  canvas: DOMRect,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const x = ((clientX - canvas.left) / canvas.width) * 100
  const y = ((clientY - canvas.top) / canvas.height) * 100
  return {
    x: Math.min(92, Math.max(2, x)),
    y: Math.min(96, Math.max(2, y)),
  }
}

export function pointerAngle(centerX: number, centerY: number, clientX: number, clientY: number): number {
  return (Math.atan2(clientY - centerY, clientX - centerX) * 180) / Math.PI
}
