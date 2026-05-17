from django.db import models


class Post(models.Model):
    content = models.TextField()
    media_url = models.URLField(max_length=1024, blank=True, default='')
    media_type = models.CharField(
        max_length=10,
        choices=[('image', 'Image'), ('video', 'Video'), ('none', 'None')],
        default='none',
    )
    author_name = models.CharField(max_length=255)
    author_email = models.EmailField()
    visibility = models.CharField(
        max_length=10,
        choices=[('only_me', 'Only Me'), ('friends', 'Friends'), ('public', 'Public')],
        default='public',
    )
    is_post_of_the_day = models.BooleanField(default=False)
    media_items = models.JSONField(default=list, blank=True, null=True)
    likes_count = models.IntegerField(default=0)
    comments_count = models.IntegerField(default=0)
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_date']

    def __str__(self):
        return f"{self.author_name}: {self.content[:50]}"


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    author_name = models.CharField(max_length=255)
    author_email = models.EmailField()
    parent_comment = models.ForeignKey(
        'self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies'
    )
    media_url = models.URLField(max_length=1024, blank=True, default='')
    media_type = models.CharField(
        max_length=10,
        choices=[('none', 'None'), ('image', 'Image'), ('video', 'Video'), ('gif', 'GIF'), ('sticker', 'Sticker')],
        default='none',
    )
    voice_note_url = models.URLField(max_length=1024, blank=True, default='')
    mentioned_users = models.JSONField(blank=True, null=True, default=list)
    reactions = models.JSONField(blank=True, null=True, default=dict)
    created_date = models.DateTimeField(auto_now_add=True)

    # Frontend uses post_id as a string field for filtering
    @property
    def post_id(self):
        return str(self.post.id)

    class Meta:
        ordering = ['-created_date']

    def __str__(self):
        return f"{self.author_name} on Post#{self.post_id}"


class Campaign(models.Model):
    campaign_id = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    media_url = models.URLField(max_length=1024, blank=True, default='')
    media_type = models.CharField(
        max_length=10,
        choices=[('image', 'Image'), ('video', 'Video'), ('document', 'Document')],
        blank=True, default='',
    )
    target_amount = models.DecimalField(max_digits=12, decimal_places=2)
    collected_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_date']

    def __str__(self):
        return f"{self.campaign_id} - {self.title}"


class Donation(models.Model):
    donor_name = models.CharField(max_length=255)
    donor_email = models.EmailField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    donation_type = models.CharField(
        max_length=20,
        choices=[('charity', 'Charity'), ('sponsor_fund', 'Sponsor Fund'), ('campaign', 'Campaign')],
    )
    charity_type = models.CharField(max_length=100, blank=True, default='')
    fund_type = models.CharField(max_length=100, blank=True, default='')
    campaign_id = models.CharField(max_length=50, blank=True, default='')
    is_public = models.BooleanField(default=False)
    location = models.CharField(max_length=255, blank=True, default='')
    account_number = models.CharField(max_length=50, blank=True, default='')
    bank_title = models.CharField(max_length=255, blank=True, default='')
    transaction_screenshot = models.URLField(max_length=1024, blank=True, default='')
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_date']

    def __str__(self):
        return f"{self.donor_name} - {self.donation_type} - {self.amount}"


class Team(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    team_type = models.CharField(
        max_length=20,
        choices=[
            ('zakat_collection', 'Zakat Collection'),
            ('needy_support', 'Needy Support'),
            ('survey', 'Survey'),
            ('general', 'General'),
        ],
        default='general',
    )
    status = models.CharField(
        max_length=10,
        choices=[('active', 'Active'), ('inactive', 'Inactive')],
        default='active',
    )
    created_by_name = models.CharField(max_length=255, blank=True, default='')
    member_emails = models.JSONField(blank=True, null=True, default=list)
    cover_image_url = models.URLField(max_length=1024, blank=True, default='')
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_date']

    def __str__(self):
        return self.name


class TeamMember(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='members')
    member_email = models.EmailField()
    member_name = models.CharField(max_length=255)
    role = models.CharField(
        max_length=10,
        choices=[('leader', 'Leader'), ('member', 'Member')],
        default='member',
    )
    joined_date = models.DateField(null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)

    # Frontend uses team_id string field
    @property
    def team_id(self):
        return str(self.team.id)

    class Meta:
        ordering = ['-created_date']

    def __str__(self):
        return f"{self.member_name} ({self.team.name})"


class NeedyPerson(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='needy_persons')
    full_name = models.CharField(max_length=255)
    address = models.CharField(max_length=500, blank=True, default='')
    contact_number = models.CharField(max_length=20, blank=True, default='')
    family_size = models.IntegerField(null=True, blank=True)
    need_type = models.CharField(
        max_length=20,
        choices=[
            ('food', 'Food'), ('medical', 'Medical'), ('education', 'Education'),
            ('financial', 'Financial'), ('housing', 'Housing'), ('other', 'Other'),
        ],
    )
    monthly_income = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    description = models.TextField(blank=True, default='')
    priority = models.CharField(
        max_length=10,
        choices=[('high', 'High'), ('medium', 'Medium'), ('low', 'Low')],
        default='medium',
    )
    status = models.CharField(
        max_length=10,
        choices=[('active', 'Active'), ('assisted', 'Assisted'), ('resolved', 'Resolved')],
        default='active',
    )
    added_by = models.EmailField(blank=True, default='')
    added_by_name = models.CharField(max_length=255, blank=True, default='')
    created_date = models.DateTimeField(auto_now_add=True)

    @property
    def team_id(self):
        return str(self.team.id)

    class Meta:
        ordering = ['-created_date']

    def __str__(self):
        return self.full_name


class Poll(models.Model):
    question = models.CharField(max_length=500)
    description = models.TextField(blank=True, default='')
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    total_votes = models.IntegerField(default=0)
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_date']

    def __str__(self):
        return self.question[:50]


class PollOption(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='options')
    option_text = models.CharField(max_length=255)
    votes_count = models.IntegerField(default=0)
    created_date = models.DateTimeField(auto_now_add=True)

    @property
    def poll_id(self):
        return str(self.poll.id)

    def __str__(self):
        return f"{self.option_text} ({self.poll.question[:30]})"


class PollVote(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name='votes')
    option = models.ForeignKey(PollOption, on_delete=models.CASCADE, related_name='vote_records')
    voter_email = models.EmailField()
    created_date = models.DateTimeField(auto_now_add=True)

    @property
    def poll_id(self):
        return str(self.poll.id)

    @property
    def option_id(self):
        return str(self.option.id)

    class Meta:
        unique_together = ['poll', 'voter_email']

    def __str__(self):
        return f"{self.voter_email} → {self.option.option_text}"


class Survey(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='surveys')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    survey_type = models.CharField(
        max_length=20,
        choices=[
            ('household', 'Household'), ('infrastructure', 'Infrastructure'),
            ('health', 'Health'), ('education', 'Education'), ('general', 'General'),
        ],
        default='general',
    )
    status = models.CharField(
        max_length=10,
        choices=[('draft', 'Draft'), ('active', 'Active'), ('completed', 'Completed')],
        default='draft',
    )
    questions = models.JSONField(blank=True, null=True, default=list)
    created_by = models.EmailField(blank=True, default='')
    created_by_name = models.CharField(max_length=255, blank=True, default='')
    created_date = models.DateTimeField(auto_now_add=True)

    @property
    def team_id(self):
        return str(self.team.id)

    class Meta:
        ordering = ['-created_date']

    def __str__(self):
        return self.title


class SurveyResponse(models.Model):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='responses')
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='survey_responses')
    respondent_name = models.CharField(max_length=255)
    respondent_address = models.CharField(max_length=500, blank=True, default='')
    answers = models.JSONField(blank=True, null=True, default=list)
    submitted_by = models.EmailField(blank=True, default='')
    submitted_by_name = models.CharField(max_length=255, blank=True, default='')
    notes = models.TextField(blank=True, default='')
    created_date = models.DateTimeField(auto_now_add=True)

    @property
    def survey_id(self):
        return str(self.survey.id)

    @property
    def team_id(self):
        return str(self.team.id)

    class Meta:
        ordering = ['-created_date']

    def __str__(self):
        return f"{self.respondent_name} - {self.survey.title}"


class Report(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='reports')
    reporter_email = models.EmailField()
    reporter_name = models.CharField(max_length=255, blank=True, default='')
    reason = models.CharField(
        max_length=20,
        choices=[
            ('spam', 'Spam'), ('hate_speech', 'Hate Speech'), ('violence', 'Violence'),
            ('misinformation', 'Misinformation'), ('nudity', 'Nudity'), ('other', 'Other'),
        ],
    )
    notes = models.TextField(blank=True, default='')
    status = models.CharField(
        max_length=10,
        choices=[('pending', 'Pending'), ('reviewed', 'Reviewed'), ('dismissed', 'Dismissed')],
        default='pending',
    )
    post_author_email = models.EmailField(blank=True, default='')
    post_content_preview = models.CharField(max_length=200, blank=True, default='')
    created_date = models.DateTimeField(auto_now_add=True)

    @property
    def post_id(self):
        return str(self.post.id)

    class Meta:
        ordering = ['-created_date']

    def __str__(self):
        return f"Report: {self.reason} on Post#{self.post_id}"


class Advertisement(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    image_url = models.URLField(max_length=1024, blank=True, default='')
    link_url = models.URLField(max_length=1024, blank=True, default='')
    is_active = models.BooleanField(default=True)
    placement = models.CharField(
        max_length=10,
        choices=[('feed', 'Feed'), ('sidebar', 'Sidebar'), ('banner', 'Banner')],
        default='feed',
    )
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_date']

    def __str__(self):
        return self.title


class LiveBroadcast(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    broadcaster_name = models.CharField(max_length=255)
    broadcaster_email = models.EmailField()
    stream_url = models.URLField(max_length=1024, blank=True, default='')
    thumbnail_url = models.URLField(max_length=1024, blank=True, default='')
    is_live = models.BooleanField(default=False)
    viewers_count = models.IntegerField(default=0)
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_date']

    def __str__(self):
        return self.title


class ZakatCollection(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='zakat_collections')
    collector_name = models.CharField(max_length=255)
    collector_email = models.EmailField(blank=True, default='')
    donor_name = models.CharField(max_length=255)
    donor_address = models.CharField(max_length=500, blank=True, default='')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    collection_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    status = models.CharField(
        max_length=15,
        choices=[('collected', 'Collected'), ('pending', 'Pending'), ('distributed', 'Distributed')],
        default='collected',
    )
    created_date = models.DateTimeField(auto_now_add=True)

    @property
    def team_id(self):
        return str(self.team.id)

    class Meta:
        ordering = ['-created_date']

    def __str__(self):
        return f"{self.donor_name} - {self.amount}"


class AboutSection(models.Model):
    section_key = models.CharField(max_length=50, unique=True)
    title = models.CharField(max_length=255)
    content = models.TextField()
    order = models.IntegerField(default=0)
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class CharityType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')
    created_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class FundType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')
    created_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Personality(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    image_url = models.URLField(max_length=1024, blank=True, default='')
    designation = models.CharField(max_length=255, blank=True, default='')
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Personalities"
        ordering = ['-created_date']

    def __str__(self):
        return self.name


class VillageHistory(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    image_url = models.URLField(max_length=1024, blank=True, default='')
    year = models.CharField(max_length=50, blank=True, default='')
    order = models.IntegerField(default=0)
    created_date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Village Histories"
        ordering = ['order', '-created_date']

    def __str__(self):
        return self.title
