import { ref } from "vue";
import printAnalysisModal from "./printAnalysisModal.vue";

export const showPrintAnalysisModal = ref(false);
export const printAnalysisSeedUrl = ref("");

export function usePrintAnalysisModal() {
  /** 打开解构分析弹窗；seedUrl 可预填一张图 */
  function open(seedUrl?: string) {
    printAnalysisSeedUrl.value = seedUrl || "";
    showPrintAnalysisModal.value = true;
  }

  return {
    show: showPrintAnalysisModal,
    open,
    component: printAnalysisModal,
    seedUrl: printAnalysisSeedUrl,
  };
}
