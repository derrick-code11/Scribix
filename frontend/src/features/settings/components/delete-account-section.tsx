import { Link } from "react-router-dom";
import type { UseMutationResult } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type DeleteMutation = UseMutationResult<
  { deleted: boolean },
  Error,
  void,
  unknown
>;

export function DeleteAccountSection({
  deleteOpen,
  onOpen,
  onClose,
  deleteConfirm,
  onDeleteConfirmChange,
  canDelete,
  deleteMutation,
  onConfirmDelete,
}: {
  deleteOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  deleteConfirm: string;
  onDeleteConfirmChange: (v: string) => void;
  canDelete: boolean;
  deleteMutation: DeleteMutation;
  onConfirmDelete: () => void;
}) {
  return (
    <>
      <section className="mt-8 rounded-xl border border-red-500/25 bg-red-500/4 p-6 shadow-sm sm:p-8">
        <h2 className="font-mono text-xs uppercase tracking-wider text-red-700/90 dark:text-red-400/90">
          Danger zone
        </h2>
        <div className="mt-3 max-w-xl space-y-3 text-sm leading-relaxed text-scribix-text/80">
          <p>
            Deleting your account permanently removes your profile and content
            from Scribix. You won&apos;t be able to restore your account or
            posts.
          </p>
          <p>
            Some information may remain in our backups for a limited period, as
            described in our{" "}
            <Link
              to="/privacy"
              className="text-scribix-primary underline-offset-2 hover:underline"
            >
              Privacy Policy
            </Link>
            . Signing in with Google again may create a new account rather than
            recover this one.
          </p>
        </div>
        <Button
          variant="secondary"
          className="mt-5 border-red-400/80 bg-red-50/90 text-red-800 shadow-sm transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white dark:border-red-500/45 dark:bg-red-950/35 dark:text-red-200 dark:hover:border-red-500 dark:hover:bg-red-600 dark:hover:text-white"
          onClick={onOpen}
        >
          Delete account
        </Button>
      </section>

      {deleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deleteMutation.isPending) {
              onClose();
            }
          }}
        >
          <div className="w-full max-w-md rounded-xl border border-scribix-border bg-scribix-panel p-6 shadow-xl">
            <h3
              id="delete-account-title"
              className="font-display text-xl text-scribix-text"
            >
              Delete your account?
            </h3>
            <p className="mt-2 text-sm text-scribix-text-muted">
              This permanently deletes your account and associated data from
              Scribix. If you&apos;re sure, type{" "}
              <span className="font-mono text-scribix-text">DELETE</span> below.
            </p>
            <Input
              value={deleteConfirm}
              onChange={(e) => onDeleteConfirmChange(e.target.value)}
              placeholder="DELETE"
              className="mt-4 font-mono"
              autoComplete="off"
              autoFocus
            />
            {deleteMutation.isError && (
              <p className="mt-2 text-xs text-red-600">
                Could not delete account. Try again.
              </p>
            )}
            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <button
                type="button"
                disabled={!canDelete}
                onClick={onConfirmDelete}
                className="inline-flex items-center justify-center rounded-sm border border-red-400 bg-red-600 px-5 py-2.5 text-sm font-medium font-mono tracking-tight text-white shadow-sm transition-opacity hover:bg-red-700 disabled:pointer-events-none disabled:opacity-40"
              >
                {deleteMutation.isPending ? "Deleting…" : "Delete account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
