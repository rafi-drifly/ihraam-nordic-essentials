/**
 * Stand-in for the "cloudflare:workers" module, which only exists inside the
 * Workers runtime. Lets tests import Worker files that declare entrypoints.
 */
export class WorkerEntrypoint<Env = unknown> {
  protected env: Env;
  constructor(_ctx: unknown, env: Env) {
    this.env = env;
  }
}
