// Redirect stubs for posts that moved from the leader view to the dev view
// (/{lang}/blog/{slug}/ -> /{lang}/dev/blog/{slug}/). Consumed by src/redirects.njk.
const movedPosts = [
  "container-image-consistency",
  "ephemeral-sidecar-podman-pods",
  "freebsd-desktop-vs-fedora",
  "gitlab-runner-podman-quadlets",
  "jira-api-automation",
  "kde-plasma-6-enterprise-hardware",
  "kvm-bridge-networking",
  "multi-queue-worker-rq-podman",
  "podman-vs-docker",
  "ssh-tunnels-containers",
  "telegram-bot-rq-valkey",
  "universal-container-dispatcher"
];

const langs = ["ru", "en", "he"];

module.exports = langs.flatMap(lang =>
  movedPosts.map(slug => ({
    from: `/${lang}/blog/${slug}/`,
    to: `/${lang}/dev/blog/${slug}/`
  }))
);