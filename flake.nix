{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { self, nixpkgs }:
    let
      systems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];
      forAll = f: nixpkgs.lib.genAttrs systems (s: f nixpkgs.legacyPackages.${s});
    in
    {
      packages = forAll (pkgs: {
        default = pkgs.stdenv.mkDerivation (finalAttrs: {
          pname = "merobaron";
          version = "0.1.0";
          src = self;

          nativeBuildInputs = [
            pkgs.nodejs-slim_26
            pkgs.pnpm_12
            pkgs.pnpmConfigHook
          ];

          pnpmDeps = pkgs.fetchPnpmDeps {
            inherit (finalAttrs) pname version src;
            pnpm = pkgs.pnpm_12;
            fetcherVersion = 5;
            hash = "sha256-xPKs6724YVIYrMZ72ZdiVQzlP/+HXnQFHNKkY8EiDZs=";
          };

          buildPhase = ''
            pnpm lint
            pnpm test
            pnpm build
          '';
          installPhase = "cp -r dist $out";
        });
      });

      devShells = forAll (pkgs: {
        default = pkgs.mkShell {
          packages = [
            pkgs.nodejs-slim_26
            pkgs.pnpm_12
          ];
          PLAYWRIGHT_BROWSERS_PATH = pkgs.playwright-driver.browsers;
          PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1";
        };
      });

      checks = forAll (pkgs: {
        build = self.packages.${pkgs.stdenv.hostPlatform.system}.default;
      });
    };
}
