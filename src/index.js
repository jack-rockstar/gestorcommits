import { intro, outro, select, confirm, text, multiselect, isCancel } from '@clack/prompts'
import { COMMIT_TYPES } from './commit-types.js'
import colors from 'picocolors'
import { trytm } from '@bdsqqq/try'
import { getChangedFiles, getStagedFiles, gitAdd, gitBranch, gitCheckout, gitCommit, gitPushOrigin } from './git.js'
import { exitProgram } from './utils.js'

intro(
  colors.blue(`Asistente para la creacion de commits por ${colors.bold(' @jack ')}`)

)
const [changedFiles, errorChangedFiles] = await trytm(getChangedFiles())
const [stagedFiles, errorStagedFiles] = await trytm(getStagedFiles())

if (errorChangedFiles ?? errorStagedFiles) {
  outro(colors.red('Error: comprueba que estas en un repositorio de git'))
  process.exit(1)
}

if (stagedFiles.length === 0 && changedFiles.length > 0) {
  const files = await multiselect({
    message: colors.cyan('Selecciona los ficheros que quieres añadir al commit: '),
    options: changedFiles.map(file => ({
      value: file,
      label: file
    }))
  })

  if (isCancel(files)) exitProgram({ message: 'No hay archivos para commitear' })
  await gitAdd({ files })
}

const commitType = await select({
  message: colors.cyan('Selecciona el tipo de commit: '),
  options: Object.entries(COMMIT_TYPES).map(([key, value]) => ({
    value: key,
    label: `${value.emoji} ${key.padEnd(8, ' ')} . ${value.description}`
  }))
})
if (isCancel(commitType)) exitProgram({ message: 'No hay archivos para commitear' })

const commitMsg = await text({
  message: colors.cyan('Introduce el mensaje del commit:'),
  validate: (value) => {
    if (value.length === 0) {
      return colors.red('El mensaje no puede estar vacio')
    }
    if (value.length > 40) {
      return colors.red('El mensaje no puede tener mas de 25 caracteres')
    }
  }
})
if (isCancel(commitMsg)) exitProgram()

const { emoji, release } = COMMIT_TYPES[commitType]

let breakingChange = false
if (release) {
  breakingChange = await confirm({
    initialValue: false,
    message: `${colors.cyan('¿Tiene este commit cambios que rompen la compatibilidad anterior?')}
    
    ${colors.yellow('Si la respuesta es si, deberias crear un commit con el tipo "BREAKING CHANGE" y al hacer release se publicara una version mayor')}
    `
  })
  if (isCancel(breakingChange)) exitProgram()
}

let commit = `${emoji} ${commitType}: ${commitMsg}`
commit = breakingChange ? `${commit} [Breaking Change]` : commit

const shouldContinue = await confirm({
  initialValue: true,
  message: `${colors.cyan('¿Quieres crear el commit con el siguiente mensaje?')}

  ${colors.green(colors.bold(commit))}

  ${colors.cyan('¿Confirmas?')}`
})

if (!shouldContinue) exitProgram()

await gitCommit({ commit })

outro(
  colors.green('🛫 Commit creado con exito')
)

const [branch, erroBranch] = await trytm(gitBranch())
let branchSelected

if (branch.length > 0) {
  branchSelected = await select({
    message: colors.cyan('Selecciona la rama donde quieres subir los cambios: '),
    options: branch.map(branch => ({
      value: branch.replaceAll('*', '').trim(),
      label: branch
    }))
  })

  if (isCancel(branchSelected)) exitProgram({ message: 'No existe una rama para hacer el push' })
}

const confirmBranch = await confirm({
  initialValue: false,
  message: `${colors.cyan(`¿Estas seguro de subir los cambios a la rama [${colors.red(`* ${branchSelected}`)}] ?`)}`
})

if (!confirmBranch) exitProgram({ message: `Se rechazo la subida de los cambios a la rama ${branchSelected}` })
if (branch.length > 1) await gitCheckout({ branch: branchSelected })

const [setPush, erroPush] = await trytm(gitPushOrigin({ branch: branchSelected }))

if (!erroPush) {
  outro(
    colors.green('🛫 se subieron cambios al repositorio. ¡Gracias por usar al asistente 🐛💯!')
  )
}
