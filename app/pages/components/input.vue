<script setup lang="ts">
import z from 'zod';
import { formDataBuilder } from '~/utils/helpers';

definePageMeta({
  middleware: 'auth',
  activeMenu: ['components', 'input']
});

useHead({
  title: 'Input'
});

const selectionSchema = z.object({
  value: z.union([z.string(), z.number()]),
  label: z.string()
});

const formSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name'),
  email: z.email('Invalid email address'),
  gender: z
    .string()
    .min(1, 'Choose your gender')
    .refine((v) => ['male', 'female'].includes(v), 'Invalid gender'),
  address: z.string().trim().min(1, 'Enter your address'),
  phone: z.string().trim().min(1, 'Enter your phone number'),
  dob: z.iso.datetime('Please enter date of birth'),
  hobbies: z.array(z.string()).min(1, 'Please select hobby'),
  job: z.custom<z.output<typeof selectionSchema> | undefined>(
    (val) => selectionSchema.safeParse(val).success,
    'Please select job title'
  ),
  file: z.custom<File | undefined>((value) => value instanceof File, 'Please upload file')
});

const formModel = reactive<z.output<typeof formSchema>>({
  name: '',
  email: '',
  gender: '',
  address: '',
  phone: '',
  dob: '',
  job: undefined,
  file: undefined as File | undefined,
  hobbies: []
});

const loading = ref(false);

const formHandler = defineFormHandler({
  state: formModel,
  schema: formSchema,
  async onSubmit(data) {
    try {
      loading.value = true;

      const formData = formDataBuilder({ ...omit(data, 'job'), job: data.job!.value });
      console.log([...formData.entries()]);
      loading.value = false;
    }
    catch (err) {
      loading.value = false;
      useRequestError(err);
    }
  }
});
</script>

<template>
  <div class="p-5">
    <UCard>
      <div class="text-xl font-semibold mb-8">
        Input
      </div>

      <UForm
        v-bind="formHandler"
        class="space-y-6"
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
          <DatePicker
            v-model="formModel.dob"
            :creator="(d) => d.toISOString()"
          />
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
          <UInputTags
            v-model="formModel.hobbies"
            class="w-full"
            placeholder="Input some item..."
          />
        </UFormField>

        <UFormField
          label="Job Title"
          name="job"
        >
          <MultiSelect
            v-model="formModel.job"
            url="/api-dev/test"
            paginated
            placeholder="Search anything..."
            :transform-fetch-query="(q) => ({ ...q, modules: 'person' })"
            :transform-fetch-data="(res) => toArray(res.data).map((val) => ({ value: val.id, label: val.person.jobTitle }))"
            :debounce="500"
          />
        </UFormField>

        <UFormField
          label="Resume"
          name="file"
        >
          <UFileUpload
            v-slot="{ open }"
            v-model="formModel.file"
            class="mb-5"
          >
            <UButtonGroup
              class="w-full"
              size="lg"
            >
              <UButton
                label="Choose file"
                @click="open()"
              />
              <UInput
                :model-value="formModel.file?.name"
                placeholder="Upload file here"
                readonly
                class="grow shrink"
                @click="open()"
              />
            </UButtonGroup>
          </UFileUpload>
        </UFormField>

        <div class="flex justify-end">
          <UButton
            type="submit"
            :loading="loading"
          >
            Submit
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>
