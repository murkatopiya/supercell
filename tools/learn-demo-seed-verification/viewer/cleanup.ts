/** Local resource ownership: register immediately after creation, release in reverse.
 * Cleanup errors are returned, never thrown over the original initialization error. */
export class CleanupScope {
  private releases: (() => void)[] = [];
  private closed = false;
  defer(release: () => void): void { this.releases.push(release); }
  own<T extends { dispose(): void }>(resource: T): T {
    this.defer(() => resource.dispose()); return resource;
  }
  dispose(): unknown[] {
    if (this.closed) return [];
    this.closed = true;
    const errors: unknown[] = [];
    for (const release of this.releases.reverse()) try { release(); } catch (error) { errors.push(error); }
    this.releases = [];
    return errors;
  }
}
