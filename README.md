# s3-utils
## Aplicación de consola simple nodejs para listar / eliminar archivos en S3 que cumplan con determinados filtros.

- Requiere crear un archivo **.env** con los valores de ejemplo que se especifican en .env.sample. Estos valores son los mismos que están en la configuración de Nimflow cuando se usa el storage tipo S3.
- npm install
- npm start

### Ver index.ts
- Variables a verificar: modifiedBefore, filterExpression y batchLimit
- Una vez que se está completamente seguro que los archivos listados son los que se pretenden eliminar, se puede eliminar el comentario de deleteS3Files
