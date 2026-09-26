import path from 'node:path';
import { finalizePresentation } from 'file:///C:/Users/Maharavo/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root=path.resolve('presentation');
const skill='C:/Users/Maharavo/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
const result=await finalizePresentation({workspaceDir:root,candidatePath:path.join(root,'.build/candidate-autoplay.pptx'),finalPath:path.join(root,'livraison/Mythenena_Soutenance.pptx'),pythonExecutable:'C:/Users/Maharavo/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu','12192000,6858000','--validate-bullet-geometry','--validate-heading-fit','--require-native-table-slide','7'],explicitTotalSlideCount:10,requiredNativeTableOwnerSlides:[7],fontPolicy:{basis:'design',families:['Arial']},verifyArtifactToolImport:true,receiptPath:path.join(root,'.build/validation-autoplay.json')});console.log(JSON.stringify(result));





