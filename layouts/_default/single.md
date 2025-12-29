## {{- /* Raw Markdown Template - Outputs original markdown source */ -}}

{{ range $key, $value := .Params -}}
{{ $key }}: {{ $value }}
{{ end -}}

---

{{ .RawContent }}
