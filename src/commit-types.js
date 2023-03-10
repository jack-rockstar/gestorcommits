export const COMMIT_TYPES = {
  feat: {
    emoji: '๐',
    description: 'Add new feature',
    release: true
  },
  fix: {
    emoji: '๐',
    description: 'Submit a fix to a bug',
    release: true
  },
  perf: {
    emoji: '๐ฏ',
    description: 'Improve performace',
    release: true
  },
  refactor: {
    emoji: '๐จ',
    description: 'Refactor code',
    release: false
  },
  docs: {
    emoji: '๐',
    description: 'Add or update documentation',
    release: false
  },
  test: {
    emoji: '๐งช',
    description: 'Add or update tests',
    release: false
  },
  build: {
    emoji: '๐',
    description: 'Add or update build scripts',
    release: false
  }

}
