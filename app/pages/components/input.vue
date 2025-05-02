<script setup lang="ts">
import { formDataBuilder } from '~/utils/helpers';
import { toArray } from '~~/shared/utils';

definePageMeta({
  middleware: 'auth',
  activeMenu: ['components', 'input']
});

useHead({
  title: 'Input'
});

const formModel = reactive({
  name: '',
  email: '',
  gender: '',
  address: '',
  phone: '',
  dob: '',
  file: undefined as File | undefined,
  hobbies: [] as string[]
});
const formRef = ref();
const loading = ref(false);

async function onSubmit() {
  try {
    loading.value = true;

    await useRequest('/profile', {
      method: 'POST',
      body: formDataBuilder(formModel)
    });
    loading.value = false;
  }
  catch (err) {
    loading.value = false;
    useRequestError(err, formRef);
  }
}
</script>

<template>
  <div class="p-5">
    <div class="w-full rounded-xl bg-white p-5">
      <div class="text-xl font-semibold mb-8">
        Input
      </div>

      <FormRoot
        ref="formRef"
        class="space-y-6"
        @submit="onSubmit"
      >
        <UFormField
          label="Name"
          name="name"
        >
          <UInput
            v-model="formModel.name"
            placeholder="Enter your name"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Email"
          name="email"
        >
          <UInput
            v-model="formModel.email"
            placeholder="Enter your email address"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Gender"
          name="gender"
        >
          <URadioGroup
            v-model="formModel.gender"
            name="gender"
            :items="[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' }
            ]"
          />
        </UFormField>

        <UFormField
          label="Date of Birth"
          name="dob"
        >
          <DatePicker v-model="formModel.dob" />
        </UFormField>

        <UFormField
          label="Address"
          name="address"
        >
          <UTextarea
            v-model="formModel.address"
            placeholder="Enter address"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Phone Number"
          name="phone"
        >
          <InputMask
            v-model="formModel.phone"
            class="w-full"
            :mask="{ mask: '0'.repeat(15) }"
            placeholder="Enter phone number"
          />
        </UFormField>

        <UFormField
          label="Hobbies"
          name="hobbies"
        >
          <MultiSelect
            url="/todos"
            paginated
            color="neutral"
            item-color="primary"
            item-variant="subtle"
            placeholder="Search anything..."
            :transform-fetch-data="(res) => toArray(res).map((val) => ({ id: val.id, label: val.task }))"
            :debounce="500"
            @update:selected="(val) => formModel.hobbies = val.map((v) => String(v.id))"
          />
        </UFormField>

        <UFormField label="Note">
          <TextEditor />
        </UFormField>

        <UFormField
          label="Resume"
          name="file"
        >
          <FormUpload
            v-slot="{ onclick }"
            v-model="formModel.file"
            class="mb-5"
          >
            <UButtonGroup
              class="w-full"
              size="lg"
            >
              <UButton
                label="Choose file"
                @click="onclick"
              />
              <UInput
                :model-value="formModel.file?.name"
                placeholder="Upload file here"
                readonly
                class="grow shrink"
                @click="onclick"
              />
            </UButtonGroup>
          </FormUpload>
        </UFormField>

        <div class="flex justify-end">
          <UButton
            type="submit"
            :loading="loading"
          >
            Submit
          </UButton>
        </div>
      </FormRoot>
    </div>
  </div>
</template>
