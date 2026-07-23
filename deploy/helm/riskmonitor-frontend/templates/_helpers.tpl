{{- define "riskmonitor-frontend.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "riskmonitor-frontend.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- printf "%s" $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "riskmonitor-frontend.labels" -}}
app.kubernetes.io/name: {{ include "riskmonitor-frontend.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
{{- end -}}

{{- define "riskmonitor-frontend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "riskmonitor-frontend.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
