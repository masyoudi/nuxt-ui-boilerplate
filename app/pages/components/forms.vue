<template>
  <UContainer class="grid grid-cols-1 gap-8 py-10">
    <UCard>
      <div class="text-lg font-semibold mb-6">Basic</div>
      <FormRoot ref="formBasicRef" class="space-y-6" @submit="onSubmitBasic">
        <UFormGroup label="Name" name="name">
          <UInput v-model="formBasicModel.name" placeholder="Enter your name" />
        </UFormGroup>

        <UFormGroup label="Email" name="email">
          <UInput v-model="formBasicModel.email" placeholder="Enter your email address" />
        </UFormGroup>

        <UFormGroup label="Gender" name="gender">
          <URadio v-model="formBasicModel.gender" label="Male" name="gender" value="male" />
          <URadio v-model="formBasicModel.gender" label="Female" name="gender" value="female" />
        </UFormGroup>

        <UFormGroup label="Address" name="address">
          <UTextarea v-model="formBasicModel.address" placeholder="Enter address" />
        </UFormGroup>

        <div class="flex justify-end">
          <UButton type="submit">Submit</UButton>
        </div>
      </FormRoot>
    </UCard>

    <UCard>
      <div class="text-lg font-semibold mb-6">Advanced</div>

      <FormRoot ref="formAdvanceRef" class="space-y-6" @submit="onSubmitAdvance">
        <UFormGroup label="Photo" name="photo">
          <UInput type="file" icon="i-heroicons-folder" @change="(files: any[]) => (formAdvanceModel.photo = files?.[0])" />
        </UFormGroup>

        <UFormGroup label="Hobbies" name="hobbies">
          <TagsInput v-model="formAdvanceModel.hobbies" placeholder="Separated with comma" />
        </UFormGroup>

        <UFormGroup label="Country" name="country">
          <DropdownAutocomplete
            v-model="formAdvanceModel.country"
            url="https://freetestapi.com/api/v1/countries"
            :transform-fetch-query="(q) => ({ search: q.search })"
            :transform-fetch-data="(val: any[]) => val.map((v) => ({ id: v.id, label: v.name }))"
            @selected="(val) => (formAdvanceModel.country = String(val?.id ?? ''))"
          ></DropdownAutocomplete>
        </UFormGroup>

        <UFormGroup label="Language" name="language">
          <DropdownSelect
            v-model="formAdvanceModel.language"
            :options="[
              { id: 'id', label: 'Bahasa Indonesia' },
              { id: 'en', label: 'English' }
            ]"
          ></DropdownSelect>
        </UFormGroup>

        <UFormGroup label="Editor">
          <TextEditor placeholder="Enter text..." :image-handler="generateImage"></TextEditor>
        </UFormGroup>

        <UFormGroup label="Date">
          <DatePicker v-model="dates" placeholder="DD/MM/YYYY - DD/MM/YYYY"></DatePicker>
        </UFormGroup>

        <UFormGroup label="Security" name="security">
          <div class="flex gap-x-2">
            <div class="inline-flex grow-0 shrink-0">
              <UToggle v-model="formAdvanceModel.security" />
            </div>
            <div class="inline-flex grow shrink text-sm">Get important notifications about your account security.</div>
          </div>
        </UFormGroup>

        <div class="flex justify-end">
          <UButton type="submit">Submit</UButton>
        </div>
      </FormRoot>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import { formDataBuilder } from '~/utils/helpers';

definePageMeta({
  middleware: 'auth',
  activeMenu: ['components', 'components-forms']
});

useHead({
  title: 'Forms'
});

const formBasicRef = ref();
const formBasicModel = reactive({
  name: '',
  email: '',
  gender: '',
  address: ''
});
const dates = ref([]);

const formAdvanceRef = ref();
const formAdvanceModel = reactive({
  photo: undefined,
  hobbies: [],
  country: '',
  language: '',
  security: true
});
const loading = ref(false);
const toast = useToast();

async function onSubmitBasic() {
  try {
    loading.value = true;
    await useRequest('/api/forms/json', {
      method: 'POST',
      body: formBasicModel,
      formRef: formBasicRef
    });

    toast.add({ description: 'Data successfully submitted', color: 'green' });
  } catch {
    loading.value = false;
  }
}

async function onSubmitAdvance() {
  try {
    loading.value = true;
    await useRequest('/api/forms/form-data', {
      method: 'POST',
      body: formDataBuilder(formAdvanceModel),
      formRef: formAdvanceRef
    });

    toast.add({ description: 'Data successfully submitted', color: 'green' });
  } catch {
    loading.value = false;
  }
}

function generateImage(file: File) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => resolve(reader.result as string));
    reader.addEventListener('error', () => resolve(''));
    reader.readAsDataURL(file);
  });
}
</script>
