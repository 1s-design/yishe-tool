<template>
  >
    <section class="operate-section">
      <h4 class="operate-section__title">音符</h4>
      
        <operate-form-item>
          <template #name>谱号</template>
          <template #content>
            <Select v-model="currentOperatingCanvasChild.clef">
              <SelectTrigger class="h-6 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="treble">高音谱号 (Treble)</SelectItem>
                <SelectItem value="bass">低音谱号 (Bass)</SelectItem>
                <SelectItem value="alto">中音谱号 (Alto)</SelectItem>
                <SelectItem value="tenor">次中音谱号 (Tenor)</SelectItem>
              </SelectContent>
            </Select>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>拍号</template>
          <template #content>
            <Select v-model="currentOperatingCanvasChild.timeSignature">
              <SelectTrigger class="h-6 text-[11px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4/4">4/4</SelectItem>
                <SelectItem value="3/4">3/4</SelectItem>
                <SelectItem value="2/4">2/4</SelectItem>
                <SelectItem value="6/8">6/8</SelectItem>
                <SelectItem value="2/2">2/2</SelectItem>
              </SelectContent>
            </Select>
          </template>
        </operate-form-item>

        <operate-form-item>
          <template #name>音符</template>
          <template #content>
            <div class="vexflow-notes-editor">
              <div
                v-for="(note, index) in currentOperatingCanvasChild.notes"
                :key="index"
                class="vexflow-notes-editor__item"
              >
                <Input
                  v-model="note.keys[0]"
                  placeholder="c/4"
                  class="vexflow-notes-editor__key h-6 text-[11px]"
                />
                <Select v-model="note.duration" class="vexflow-notes-editor__duration">
                  <SelectTrigger class="h-6 text-[11px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="w">全音符</SelectItem>
                    <SelectItem value="h">二分音符</SelectItem>
                    <SelectItem value="q">四分音符</SelectItem>
                    <SelectItem value="8">八分音符</SelectItem>
                    <SelectItem value="16">十六分音符</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  class="text-destructive hover:text-destructive"
                  @click="removeNote(index)"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </Button>
              </div>
              <Button size="sm" variant="outline" @click="addNote">添加音符</Button>
            </div>
          </template>
        </operate-form-item>
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">基础</h4>
      
        <operateItemSize
          label="尺寸"
          v-model:width="currentOperatingCanvasChild.width"
          v-model:height="currentOperatingCanvasChild.height"
        />

        <operateItemBackgroundColor v-model="currentOperatingCanvasChild.backgroundColor" />
      
    </section>

    <section class="operate-section">
      <h4 class="operate-section__title">通用属性</h4>
      
        <operateItemCommonGroup v-model="currentOperatingCanvasChild" />
      
    </section>
  
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Trash2 } from "lucide-vue-next";
import operateItemSize from "@/components/design/layout/canvas/operate/size/relativeSize.vue";
import operateItemBackgroundColor from "@/components/design/layout/canvas/operate/backgroundColor.vue";
import operateItemCommonGroup from "@/components/design/layout/canvas/operate/commonGroup.vue";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { currentOperatingCanvasChild } from "../index.tsx";


function addNote() {
  if (!currentOperatingCanvasChild.value.notes) {
    currentOperatingCanvasChild.value.notes = [];
  }
  currentOperatingCanvasChild.value.notes.push({
    keys: ["c/4"],
    duration: "q",
  });
}

function removeNote(index: number | string) {
  currentOperatingCanvasChild.value.notes.splice(Number(index), 1);
}
</script>

<style scoped>
.vexflow-notes-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vexflow-notes-editor__item {
  display: flex;
  gap: 4px;
  align-items: center;
}

.vexflow-notes-editor__key {
  flex: 1;
}

.vexflow-notes-editor__duration {
  width: 120px;
}
</style>
