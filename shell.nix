# shell.nix
{ pkgs ? import <nixpkgs> { } }:

pkgs.mkShell {
  packages = with pkgs; [
    bun
    binaryen      # provides wasm-opt
    git
  ];
}
