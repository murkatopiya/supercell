import {
  LANDING_ATTRIBUTION_ESC_CASES, LANDING_ATTRIBUTION_LABEL, LANDING_ATTRIBUTION_MOORE_CASE,
  LANDING_FOOTER_CREATED_BY, LANDING_FOOTER_PORTFOLIO_ACCESSIBLE_NAME,
  LANDING_FOOTER_PORTFOLIO_LABEL, LANDING_FOOTER_PORTFOLIO_URL,
  LANDING_FOOTER_PRODUCT, LANDING_FOOTER_PROJECT,
} from "./landingContent.js";
import { PUBLIC_VERSION, PUBLIC_VERSION_STATUS } from "./publicVersion.js";
import {
  EOL_SOUNDING_DATASET_DOI,
  EOL_SOUNDING_DATASET_DOI_URL,
  EOL_SOUNDING_DATASET_ID,
  EOL_SOUNDING_DATASET_NAME,
  EOL_SOUNDING_DATASET_URL,
  IGRA_ARCHIVE_DOI,
  IGRA_ARCHIVE_DOI_URL,
  IGRA_ARCHIVE_SHORT_NAME,
  IGRA_ARCHIVE_URL,
  IGRA_DSI,
  IGRA_STATION_ID,
} from "./glossaryContent.js";

import { RESOURCE_ITEMS, type OpenResource } from "./shellResources.js";
import "./shell.css";

export function GlobalFooter({ variant = "full", onOpenResource }: { variant?: "full" | "compact"; onOpenResource: OpenResource }) {
  if (variant === "compact") return (
    <footer className="global-footer global-footer--compact">
      <p className="global-footer__footer-line">{LANDING_FOOTER_PRODUCT} · {PUBLIC_VERSION}</p>
      <p className="global-footer__footer-line">{PUBLIC_VERSION_STATUS}</p>
      <DataAttribution />
    </footer>
  );
  return (
    <footer className={`global-footer global-footer--${variant}`}>
        <div className="global-footer__footer-identity">
          <p className="global-footer__footer-line">
            {LANDING_FOOTER_PRODUCT} · {PUBLIC_VERSION} · {PUBLIC_VERSION_STATUS}
          </p>
          <p className="global-footer__footer-line">
            {LANDING_FOOTER_CREATED_BY} ·{" "}
            <a
              className="global-footer__footer-link"
              href={LANDING_FOOTER_PORTFOLIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={LANDING_FOOTER_PORTFOLIO_ACCESSIBLE_NAME}
            >
              {LANDING_FOOTER_PORTFOLIO_LABEL}
              <span aria-hidden="true"> ↗</span>
            </a>
          </p>
        </div>
        <nav className="global-footer__resources" aria-label="Footer resources">
          {RESOURCE_ITEMS.map(item => <button key={item.id} type="button" className="shell-action" aria-haspopup="dialog"
            onClick={event => onOpenResource(item.id, event.currentTarget)}>{item.label}</button>)}
        </nav>
        <div className="global-footer__footer-meta">
          <p className="global-footer__footer-line">{LANDING_FOOTER_PROJECT}</p>
          <p className="global-footer__footer-line">Not a weather forecasting system</p>
          <DataAttribution />
        </div>
    </footer>
  );
}

/** Existing attribution content is shared by the full Footer and compact status strip. */
function DataAttribution() {
  return (
          <details className="global-footer__attribution">
            <summary className="global-footer__attribution-summary">
              {LANDING_ATTRIBUTION_LABEL}
            </summary>
            <div className="ui-panel global-footer__attribution-panel">
              <article className="global-footer__attribution-source">
                <h3 className="global-footer__attribution-case">
                  {LANDING_ATTRIBUTION_ESC_CASES}
                </h3>
                <dl className="global-footer__attribution-fields">
                  <div className="global-footer__attribution-field">
                    <dt>Dataset</dt>
                    <dd>
                      EOL{" "}
                      <a
                        className="global-footer__footer-link"
                        href={EOL_SOUNDING_DATASET_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`EOL dataset ${EOL_SOUNDING_DATASET_ID} (opens in a new tab)`}
                      >
                        {EOL_SOUNDING_DATASET_ID}
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    </dd>
                  </div>
                  <div className="global-footer__attribution-field">
                    <dt>System</dt>
                    <dd>{EOL_SOUNDING_DATASET_NAME}</dd>
                  </div>
                  <div className="global-footer__attribution-field">
                    <dt>DOI</dt>
                    <dd>
                      <a
                        className="global-footer__footer-link"
                        href={EOL_SOUNDING_DATASET_DOI_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`DOI ${EOL_SOUNDING_DATASET_DOI} (opens in a new tab)`}
                      >
                        {EOL_SOUNDING_DATASET_DOI}
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    </dd>
                  </div>
                </dl>
              </article>
              <article className="global-footer__attribution-source">
                <h3 className="global-footer__attribution-case">
                  {LANDING_ATTRIBUTION_MOORE_CASE}
                </h3>
                <dl className="global-footer__attribution-fields">
                  <div className="global-footer__attribution-field">
                    <dt>Dataset</dt>
                    <dd>
                      <a
                        className="global-footer__footer-link"
                        href={IGRA_ARCHIVE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${IGRA_ARCHIVE_SHORT_NAME} archive (opens in a new tab)`}
                      >
                        {IGRA_ARCHIVE_SHORT_NAME}
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    </dd>
                  </div>
                  <div className="global-footer__attribution-field">
                    <dt>Station</dt>
                    <dd>{IGRA_STATION_ID}</dd>
                  </div>
                  <div className="global-footer__attribution-field">
                    <dt>ID</dt>
                    <dd>{IGRA_DSI}</dd>
                  </div>
                  <div className="global-footer__attribution-field">
                    <dt>DOI</dt>
                    <dd>
                      <a
                        className="global-footer__footer-link"
                        href={IGRA_ARCHIVE_DOI_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`DOI ${IGRA_ARCHIVE_DOI} (opens in a new tab)`}
                      >
                        {IGRA_ARCHIVE_DOI}
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    </dd>
                  </div>
                </dl>
              </article>
            </div>
          </details>
  );
}
