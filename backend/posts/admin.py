from django.contrib import admin
from .models import (
    Post, Comment, Campaign, Donation, Team, TeamMember, NeedyPerson,
    Poll, PollOption, PollVote, Survey, SurveyResponse, Report,
    Advertisement, LiveBroadcast, ZakatCollection, AboutSection,
    CharityType, FundType,
)


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'author_name', 'content_preview', 'likes_count', 'created_date']
    list_filter = ['media_type']
    search_fields = ['content', 'author_name', 'author_email']

    def content_preview(self, obj):
        return obj.content[:60]


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'author_name', 'post', 'content_preview', 'created_date']
    list_filter = ['media_type']
    search_fields = ['content', 'author_name']

    def content_preview(self, obj):
        return obj.content[:60]


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ['campaign_id', 'title', 'target_amount', 'collected_amount', 'is_active']
    list_filter = ['is_active']
    search_fields = ['title', 'campaign_id']


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ['donor_name', 'amount', 'donation_type', 'is_public', 'created_date']
    list_filter = ['donation_type', 'is_public']
    search_fields = ['donor_name', 'donor_email']


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'team_type', 'status', 'created_date']
    list_filter = ['team_type', 'status']
    search_fields = ['name']


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ['member_name', 'team', 'role', 'member_email']
    list_filter = ['role']
    search_fields = ['member_name', 'member_email']


@admin.register(NeedyPerson)
class NeedyPersonAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'team', 'need_type', 'priority', 'status']
    list_filter = ['need_type', 'priority', 'status']
    search_fields = ['full_name']


@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ['question_preview', 'is_active', 'total_votes', 'end_date']
    list_filter = ['is_active']

    def question_preview(self, obj):
        return obj.question[:60]


@admin.register(PollOption)
class PollOptionAdmin(admin.ModelAdmin):
    list_display = ['option_text', 'poll', 'votes_count']


@admin.register(PollVote)
class PollVoteAdmin(admin.ModelAdmin):
    list_display = ['voter_email', 'poll', 'option']


@admin.register(Survey)
class SurveyAdmin(admin.ModelAdmin):
    list_display = ['title', 'team', 'survey_type', 'status']
    list_filter = ['survey_type', 'status']
    search_fields = ['title']


@admin.register(SurveyResponse)
class SurveyResponseAdmin(admin.ModelAdmin):
    list_display = ['respondent_name', 'survey', 'submitted_by_name', 'created_date']
    search_fields = ['respondent_name']


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ['reason', 'reporter_email', 'status', 'post', 'created_date']
    list_filter = ['reason', 'status']


@admin.register(Advertisement)
class AdvertisementAdmin(admin.ModelAdmin):
    list_display = ['title', 'placement', 'is_active', 'created_date']
    list_filter = ['placement', 'is_active']


@admin.register(LiveBroadcast)
class LiveBroadcastAdmin(admin.ModelAdmin):
    list_display = ['title', 'broadcaster_name', 'is_live', 'viewers_count']
    list_filter = ['is_live']


@admin.register(ZakatCollection)
class ZakatCollectionAdmin(admin.ModelAdmin):
    list_display = ['donor_name', 'collector_name', 'amount', 'status', 'collection_date']
    list_filter = ['status']
    search_fields = ['donor_name', 'collector_name']


@admin.register(AboutSection)
class AboutSectionAdmin(admin.ModelAdmin):
    list_display = ['section_key', 'title', 'order']


@admin.register(CharityType)
class CharityTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']


@admin.register(FundType)
class FundTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
