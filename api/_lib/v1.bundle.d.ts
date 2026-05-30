export const config: { runtime: string; maxDuration: number }

declare function handler(req: unknown, res: unknown): Promise<void>
export default handler
