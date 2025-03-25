export function getFileDirectory(path: string): string {
    return path.split('/').slice(0, -1).join('/')
}

export function getFileType(path: string): string {
    return path.split('/').pop()?.split('.').slice(0, -1).join('.') || '';
}

export function getFileName(path: string): string {
    return getFileType(path).toLowerCase() || '';
  }