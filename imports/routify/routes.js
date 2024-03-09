
/**
 * @roxi/routify 2.18.15
 * File generated Sat Mar 09 2024 17:06:08 GMT+1100 (Australian Eastern Daylight Time)
 */

export const __version = "2.18.15"
export const __timestamp = "2024-03-09T06:06:08.239Z"

//buildRoutes
import { buildClientTree } from "@roxi/routify/runtime/buildRoutes"

//imports


//options
export const options = {}

//tree
export const _tree = {
  "name": "_layout",
  "filepath": "/_layout.svelte",
  "root": true,
  "ownMeta": {},
  "absolutePath": "/Users/ben/tech_bingo/imports/ui/pages/_layout.svelte",
  "children": [
    {
      "isFile": false,
      "isDir": true,
      "file": "[game_id]",
      "filepath": "/[game_id]",
      "name": "[game_id]",
      "ext": "",
      "badExt": false,
      "absolutePath": "/Users/ben/tech_bingo/imports/ui/pages/[game_id]",
      "children": [
        {
          "isFile": false,
          "isDir": true,
          "file": "[player_id]",
          "filepath": "/[game_id]/[player_id]",
          "name": "[player_id]",
          "ext": "",
          "badExt": false,
          "absolutePath": "/Users/ben/tech_bingo/imports/ui/pages/[game_id]/[player_id]",
          "children": [
            {
              "isFile": true,
              "isDir": false,
              "file": "index.svelte",
              "filepath": "/[game_id]/[player_id]/index.svelte",
              "name": "index",
              "ext": "svelte",
              "badExt": false,
              "absolutePath": "/Users/ben/tech_bingo/imports/ui/pages/[game_id]/[player_id]/index.svelte",
              "importPath": "../ui/pages/[game_id]/[player_id]/index.svelte",
              "isLayout": false,
              "isReset": false,
              "isIndex": true,
              "isFallback": false,
              "isPage": true,
              "ownMeta": {},
              "meta": {
                "recursive": true,
                "preload": false,
                "prerender": true
              },
              "path": "/:game_id/:player_id/index",
              "id": "__game_id__player_id_index",
              "component": () => import('../ui/pages/[game_id]/[player_id]/index.svelte').then(m => m.default)
            }
          ],
          "isLayout": false,
          "isReset": false,
          "isIndex": false,
          "isFallback": false,
          "isPage": false,
          "ownMeta": {},
          "meta": {
            "recursive": true,
            "preload": false,
            "prerender": true
          },
          "path": "/:game_id/:player_id"
        },
        {
          "isFile": true,
          "isDir": false,
          "file": "index.svelte",
          "filepath": "/[game_id]/index.svelte",
          "name": "index",
          "ext": "svelte",
          "badExt": false,
          "absolutePath": "/Users/ben/tech_bingo/imports/ui/pages/[game_id]/index.svelte",
          "importPath": "../ui/pages/[game_id]/index.svelte",
          "isLayout": false,
          "isReset": false,
          "isIndex": true,
          "isFallback": false,
          "isPage": true,
          "ownMeta": {},
          "meta": {
            "recursive": true,
            "preload": false,
            "prerender": true
          },
          "path": "/:game_id/index",
          "id": "__game_id_index",
          "component": () => import('../ui/pages/[game_id]/index.svelte').then(m => m.default)
        }
      ],
      "isLayout": false,
      "isReset": false,
      "isIndex": false,
      "isFallback": false,
      "isPage": false,
      "ownMeta": {},
      "meta": {
        "recursive": true,
        "preload": false,
        "prerender": true
      },
      "path": "/:game_id"
    },
    {
      "isFile": true,
      "isDir": false,
      "file": "index.svelte",
      "filepath": "/index.svelte",
      "name": "index",
      "ext": "svelte",
      "badExt": false,
      "absolutePath": "/Users/ben/tech_bingo/imports/ui/pages/index.svelte",
      "importPath": "../ui/pages/index.svelte",
      "isLayout": false,
      "isReset": false,
      "isIndex": true,
      "isFallback": false,
      "isPage": true,
      "ownMeta": {},
      "meta": {
        "recursive": true,
        "preload": false,
        "prerender": true
      },
      "path": "/index",
      "id": "_index",
      "component": () => import('../ui/pages/index.svelte').then(m => m.default)
    }
  ],
  "isLayout": true,
  "isReset": false,
  "isIndex": false,
  "isFallback": false,
  "isPage": false,
  "isFile": true,
  "file": "_layout.svelte",
  "ext": "svelte",
  "badExt": false,
  "importPath": "../ui/pages/_layout.svelte",
  "meta": {
    "recursive": true,
    "preload": false,
    "prerender": true
  },
  "path": "/",
  "id": "__layout",
  "component": () => import('../ui/pages/_layout.svelte').then(m => m.default)
}


export const {tree, routes} = buildClientTree(_tree)

