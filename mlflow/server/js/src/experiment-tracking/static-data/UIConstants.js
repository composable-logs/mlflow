// With UI constants in separate file these can be overwritten when site is built.

import React from 'react';

export const DataBacklinkFooter = <div
    style={{ width: "65%", margin: "0 auto", color: "rgba(0, 0, 0, 0.45)" }}>
    This is a static web site built using a modified version of mlflow that generates
    static web sites. The site's UI has dynamic elements, but there is no backend with
    a database. After the assets are built they can be served from a static web host
    service (like eg. Github Pages). For more details, see main repo
    <b> <a href="https://github.com/pynb-dag-runner/pynb-dag-runner">pynb-dag-runner</a> </b>
    (open source).
</div>;

/**
 * Parameters for rendering site header
 */

export const SiteHeader = {
    // header left, top row: Page title/project name. Links to site root.
    title: "mnist-digits-demo-pipeline",
    // header right link: (linked from header "Github"-link)
    gh_link: "https://github.com/pynb-dag-runner/mnist-digits-demo-pipeline",
};
