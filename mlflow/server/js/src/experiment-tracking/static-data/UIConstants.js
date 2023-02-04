// With UI constants in separate file these can be overwritten when site is built.

import React from 'react';

export const DataBacklinkFooter = <div
    style={{ width: "65%", margin: "0 auto", color: "rgba(0, 0, 0, 0.45)", "padding-bottom": "20px" }}>
    <p>This is a static site built using a modified version of MLflow that generates
    static web sites. The output has dynamic elements, but there is no api backend or
    database. Thus, after the site has been built it can be served from a static web host
    service (like eg. Github Pages). For more details, please see the Composable Logs
    (open source) framework
    <b> <a href="https://composable-logs.github.io/composable-logs/">documentation site</a> </b>.
    </p>
</div>;

/**
 * Parameters for rendering site header
 */

export const SiteHeader = {
    // header left, top row: Page title/project name. Links to site root.
    title: "mnist-digits-demo-pipeline",
    // header right link: (linked from header "Github"-link)
    gh_link: "https://github.com/composable-logs/mnist-digits-demo-pipeline",
};
